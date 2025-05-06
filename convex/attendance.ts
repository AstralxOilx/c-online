import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";




export const createAttendanceSession = mutation({
  args: {
    classroomId: v.id("classrooms"),
    title: v.string(),
    startTime: v.string(),
    endTime: v.string(),
    endTeaching: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    if (!userId) {
      throw new Error("Unauthorized");
    }

    const now = new Date().toISOString();

    // 1. เช็คว่ามี session เปิดอยู่หรือยัง (ตอนนี้)
    const sessions = await ctx.db
      .query("attendanceSession")
      .withIndex("by_classroom", (q) => q.eq("classroomId", args.classroomId))
      .collect();

    const isSessionActive = sessions.some((session) => {
      return now <= session.endTeaching;
    });

    if (isSessionActive) {
      throw new Error("มีการเช็คชื่อที่กำลังเปิดอยู่ในห้องเรียนนี้ ไม่สามารถสร้างรอบใหม่ได้");
    }



    // 2. ไม่มี session เปิดอยู่ ➔ สร้างใหม่ได้


    return await ctx.db.insert("attendanceSession", {
      title: args.title,
      classroomId: args.classroomId,
      startTime: args.startTime,
      endTime: args.endTime,
      endTeaching: args.endTeaching,
      createdBy: userId,
      isPublished: new Date(args.startTime) <= new Date() ? true : false,
    }).then(async (id) => {
      const session = await ctx.db.get(id);
      return session;
    });
    
  },
});


export const getActiveSession = query({
  args: {
    classroomId: v.id("classrooms"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    if (!userId) {
      throw new Error("Unauthorized");
    }

    const now = new Date().toISOString();

    const sessions = await ctx.db
      .query("attendanceSession")
      .withIndex("by_classroom", (q) => q.eq("classroomId", args.classroomId))
      .collect();

    const activeSessions = sessions.filter((session) => {
      return now <= session.endTeaching;
    });

    if (activeSessions.length > 0) {
      const sessionsWithCreatorAndAttendance = await Promise.all(
        activeSessions.map(async (session) => {
          const creator = await ctx.db.get(session.createdBy); // ดึงข้อมูลผู้สร้าง session

          // เช็คการเช็คชื่อของนักเรียนใน session นี้
          const attendance = await ctx.db
            .query("attendance")
            .withIndex("by_session_user", (q) =>
              q.eq("sessionId", session._id).eq("userId", userId)
            )
            .unique();

          return {
            ...session,
            creator,
            isCheckedIn: attendance ? true : false, // ถ้ามีข้อมูลแสดงว่านักเรียนเช็คชื่อแล้ว
          };
        })
      );

      return sessionsWithCreatorAndAttendance;
    }

    return null;
  },
});


export const deleteAttendanceSession = mutation({
  args: {
    id: v.id("attendanceSession"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    if (!userId) {
      throw new Error("Unauthorized");
    }

    const session = await ctx.db.get(args.id);
    if (!session) {
      throw new Error("ไม่พบการเช็คชื่อที่ต้องการลบ");
    }

    // ดึงข้อมูล attendances ก่อนลบ
    const attendances = await ctx.db
      .query("attendance")
      .withIndex("by_session_user", (q) => q.eq("sessionId", args.id))
      .collect();

    // ลบ attendance ทั้งหมด
    for (const attendance of attendances) {
      await ctx.db.delete(attendance._id);
    }

    // ลบ session
    await ctx.db.delete(args.id);

    // ส่งข้อมูล session ที่ลบกลับไป (เช่น ชื่อ, เวลา ฯลฯ)
    return {
      ...session,
      deletedAttendancesCount: attendances.length,
    };
  },
});


export const studentCheckIn = mutation({
  args: {
    sessionId: v.id("attendanceSession"),
    description: v.optional(v.string()),
    status: v.union(
      v.literal("present"),
      v.literal("late"),
      v.literal("leave")
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    if (!userId) {
      throw new Error("Unauthorized");
    }
    const session = await ctx.db.get(args.sessionId);
    if (!session) throw new Error("ไม่พบรอบการเช็คชื่อ");

    const members = await ctx.db
      .query("classroomMembers")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .collect();

    const member = members.find((m) => m.classroomId === session.classroomId);
    if (!member || member.status !== "active") {
      throw new Error("Unauthorized");
    }

    const now = new Date().toISOString();

    if (now < session.startTime || now > session.endTeaching) {
      throw new Error("ไม่อยู่ในช่วงเวลาที่อนุญาตให้เช็คชื่อ");
    }

    const already = await ctx.db
      .query("attendance")
      .withIndex("by_session_user", (q) =>
        q.eq("sessionId", args.sessionId).eq("userId", userId)
      )
      .unique();

    if (already) {
      throw new Error("คุณได้เช็คชื่อไปแล้ว");
    }

    // ✅ ตรวจสอบสถานะโดยไม่ใช้ args.status แล้ว
    let status: "present" | "late" | "leave";

    if (args.status === "leave") {
      status = "leave";
    } else if (now <= session.endTime) {
      status = "present";
    } else {
      status = "late";
    }

    return await ctx.db.insert("attendance", {
      sessionId: args.sessionId,
      userId: userId,
      description: args.description,
      status,
      timestamp: now,
    });
  },
});



export const getAttendanceForClassroom = query({
  args: {
    classroomId: v.id("classrooms"),
  },
  handler: async (ctx, args) => {
    const now = new Date().toISOString();

    // ดึงข้อมูลรอบการเช็คชื่อทั้งหมดในห้องเรียนที่ระบุ
    const sessions = await ctx.db
      .query("attendanceSession")
      .withIndex("by_classroom", (q) => q.eq("classroomId", args.classroomId))
      .collect();

    // ดึงข้อมูลสมาชิกในห้องเรียน
    const classroomStudents = await ctx.db
      .query("classroomMembers")
      .withIndex("by_classroom_id_user_id", (q) => q.eq("classroomId", args.classroomId))
      .collect();

    // ตรวจสอบว่า classroomStudents มีข้อมูลหรือไม่
    if (classroomStudents.length === 0) {
      return { students: [], attendanceData: [] };
    }

    // ดึงข้อมูลนักเรียนจาก classroomMembers และกรองเฉพาะนักเรียนที่มีสถานะ active
    const studentDetails = await Promise.all(
      classroomStudents.map(async (classroomStudent) => {
        const student = await ctx.db.get(classroomStudent.userId);

        // ตรวจสอบว่า user เป็นนักเรียนและส่งข้อมูลนักเรียน
        if (student?.role === "student") {
          return {
            userId: classroomStudent.userId,
            studentFname: student.fname,
            studentLname: student.lname,
            studentEmail: student.email,
            studentIdentificationCode: student.identificationCode,
          };
        }
      })
    );

    // กรองข้อมูลที่เป็น undefined ออก
    const activeStudents = studentDetails.filter((student) => student !== undefined);

    // ถ้าไม่มี session ก็คืนแค่ข้อมูลนักเรียน
    if (sessions.length === 0) {
      return {
        students: activeStudents,
        attendanceData: [],
      };
    }

    // ดึงข้อมูลการเช็คชื่อของนักเรียนในแต่ละ session
    const attendanceData = await Promise.all(
      sessions.map(async (session) => {
        const attendanceRecords = await ctx.db
          .query("attendance")
          .withIndex("by_session_user", (q) => q.eq("sessionId", session._id))
          .collect();

        const attendanceWithStudentDetails = await Promise.all(
          attendanceRecords.map(async (attendance) => {
            const student = await ctx.db.get(attendance.userId);
            return {
              userId: attendance.userId,
              studentFname: student?.fname,
              studentLname: student?.lname,
              studentEmail: student?.email,
              studentIdentificationCode: student?.identificationCode,
              status: attendance.status,
              timestamp: attendance.timestamp,
              description: attendance.description,
            };
          })
        );

        const countStatusPerStudent = attendanceRecords.map((attendance) => {
          const studentStatus = {
            userId: attendance.userId,
            present: 0,
            late: 0,
            leave: 0,
            absent: 0,
          };

          if (attendance.status === "present") studentStatus.present++;
          if (attendance.status === "late") studentStatus.late++;
          if (attendance.status === "leave") studentStatus.leave++;
          if (attendance.status === "absent") studentStatus.absent++;

          return studentStatus;
        });

        const countStatus = attendanceRecords.reduce(
          (acc, attendance) => {
            if (attendance.status === "present") acc.present++;
            if (attendance.status === "late") acc.late++;
            if (attendance.status === "leave") acc.leave++;
            if (attendance.status === "absent") acc.absent++;
            return acc;
          },
          { present: 0, late: 0, leave: 0, absent: 0 }
        );

        return {
          sessionId: session._id,
          sessionTitle: session.title,
          attendanceRecords: attendanceWithStudentDetails,
          countStatus,
          countStatusPerStudent,
        };
      })
    );

    return {
      students: activeStudents,
      attendanceData,
    };
  },
});





// export const getAttendanceSession = query({
//   args: {
//     workspaceId: v.id("workspaces"),
//   },
//   handler: async (ctx, args) => {
//     const currentUserId = await auth.getUserId(ctx);
//     if (!currentUserId) throw new Error("Unauthorized");

//     const members = await ctx.db
//       .query("members")
//       .withIndex("by_user_id", (q) => q.eq("userId", currentUserId))
//       .collect();

//     // ✅ หา member ที่อยู่ในห้องเดียวกับ session
//     const member = members.find(
//       (m) => m.workspaceId === args.workspaceId
//     );

//     if (!member || member.role !== "student") {
//       throw new Error("Unauthorized");
//     }


//     const now = new Date().toISOString();

//     const allSessions = await ctx.db
//       .query("attendanceSession")
//       .withIndex("by_workspace_id_and_startTime_and_endTime", (q) =>
//         q.eq("workspaceId", args.workspaceId)
//       )
//       .collect();

//     const sessions = allSessions.filter((session) =>
//       session.startTime <= now && session.endTeaching >= now
//     );

//     const currentSession = sessions[0];
//     if (!currentSession) {
//       throw new Error("ไม่พบรอบการเช็คชื่อในขณะนี้");
//     }


//     return {
//       sessions: await Promise.all(
//         sessions
//           .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()) // sort ตรงนี้!
//           .map(async (session) => {
//             const already = await ctx.db
//               .query("attendance")
//               .withIndex("by_session_user", (q) =>
//                 q.eq("sessionId", session._id).eq("userId", currentUserId)
//               )
//               .unique();

//             return {
//               ...session,
//               alreadyAttendance: !!already,
//               attendanceData: already ?? null, // ข้อมูลการเช็คชื่อ ถ้ามี
//             };
//           })
//       )
//     };


//   }
// });

