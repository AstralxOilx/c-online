import { v } from "convex/values";
import { query, QueryCtx } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { getAuthUserId } from "@convex-dev/auth/server";


const getMember = async (ctx: QueryCtx, classroomId: Id<"classrooms">, userId: Id<"users">) => {
  return ctx.db
    .query("classroomMembers")
    .withIndex("by_classroom_id_user_id", (q) => q.eq("classroomId", classroomId).eq("userId", userId))
    .unique();
}

export const getScore = query({
  args: {
    classroomId: v.id("classrooms"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    if (!userId) {
      throw new Error("Unauthorized");
    }

    // assignments ทั้งหมดใน workspace
    const assignments = await ctx.db
      .query("assignments")
      .withIndex("by_classroom_id", (q) => q.eq("classroomId", args.classroomId))
      .collect();

    const assignmentMap = new Map(
      assignments.map((a) => [a._id, a])
    );

    const totalPossibleScore = assignments.reduce(
      (sum, a) => sum + (a.score ?? 0),
      0
    );

    // submission ทั้งหมดของ user
    const submissions = await ctx.db
      .query("submitAssignments")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .collect();

    const filtered = submissions.filter(
      (s) => s.classroomId === args.classroomId
    );

    let totalScore = 0;
    let count = 0;
    const details = [];

    // สถิติสถานะการส่ง
    let submitted = 0;
    let late = 0;
    let canResubmit = 0;

    for (const submission of filtered) {
      // นับ status
      if (submission.status === "submitted") submitted++;
      else if (submission.status === "late") late++;
      else if (submission.status === "canResubmit") canResubmit++;

      // ✅ เพิ่มตรงนี้เพื่อรวมคะแนน
      if (typeof submission.score === "number") {
        totalScore += submission.score;
        count++;
      }

      const assignment = assignmentMap.get(submission.assignmentId);

      details.push({
        assignmentId: submission.assignmentId,
        assignmentTitle: assignment?.name ?? "ไม่ทราบชื่อ",
        maxScore: assignment?.score ?? 0,
        score: submission.score,
        status: submission.status,
        submittedAt: submission._creationTime ?? null,
      });
    }
    const totalAssignments = assignments.length;

    return {
      totalScore,
      totalPossibleScore,
      averageScore: count > 0 ? totalScore / count : null,
      percentage:
        totalPossibleScore > 0 ? (totalScore / totalPossibleScore) * 100 : null,
      submissionCount: filtered.length,
      scoredCount: count,
      totalAssignments, // ✅ เพิ่มตรงนี้
      submitStatusSummary: {
        submitted,
        late,
        canResubmit,
      },
      details,
    };
  },
});


export const getAttendanceStatus = query({
  args: {
    classroomId: v.id("classrooms"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    if (!userId) {
      throw new Error("Unauthorized");
    }

    // ดึง session ทั้งหมดใน workspace
    const sessions = await ctx.db
      .query("attendanceSession")
      .withIndex("by_classroom", (q) => q.eq("classroomId", args.classroomId))
      .collect();

    const results = [];
    const statusCount = {
      present: 0,
      late: 0,
      leave: 0,
      absent: 0,
    };

    for (const session of sessions) {
      // ดึงข้อมูลการเช็คชื่อของ currentUser สำหรับ session นี้
      const attendance = await ctx.db
        .query("attendance")
        .withIndex("by_session_user", (q) =>
          q.eq("sessionId", session._id).eq("userId", userId)
        )
        .first();

      const status = attendance?.status ?? "absent"; // ถ้าไม่มีข้อมูล ให้ถือว่าไม่มา
      statusCount[status]++;

      results.push({
        sessionId: session._id,
        title: session.title,
        startTime: session.startTime,
        endTime: session.endTime,
        endTeaching: session.endTeaching,
        status,
        timestamp: attendance?.timestamp ?? null,
        description: attendance?.description ?? null,
      });
    }

    return {
      studentId: userId,
      attendance: results,
      statusSummary: statusCount, // ส่งข้อมูลสรุปจำนวนสถานะเข้าเรียน
    };
  },
});



// export const getClassroomOverviewForTeacher = query({
//   args: {
//     classroomId: v.id("classrooms"),
//   },
//   handler: async (ctx, args) => {
//     const userId = await getAuthUserId(ctx);

//     if (!userId) {
//       throw new Error("Unauthorized");
//     }

//     // ตรวจสอบสิทธิ์ครู
//     const member = await ctx.db
//       .query("users")
//       .withIndex("by_id", (q) => q.eq("_id", userId))
//       .first();

//     if (!member || member.role !== "teacher") {
//       throw new Error("Access denied");
//     }

//     const assignments = await ctx.db
//       .query("assignments")
//       .withIndex("by_classroom_id", (q) => q.eq("classroomId", args.classroomId))
//       .collect();

//     const submissions = await ctx.db
//       .query("submitAssignments")
//       .withIndex("by_classroom_id", (q) => q.eq("classroomId", args.classroomId))
//       .collect();

//     const submittedStudents = new Set(submissions.map((s) => s.userId));
//     const studentsSubmittedCount = submittedStudents.size;

//     const assignmentsWithNoSubmissions = assignments.filter(
//       (a) => !submissions.find((s) => s.assignmentId === a._id)
//     );

//     const submitStatusSummary = {
//       submitted: submissions.filter((s) => s.status === "submitted").length,
//       late: submissions.filter((s) => s.status === "late").length,
//       canResubmit: submissions.filter((s) => s.status === "canResubmit").length,
//     };

//     const sessions = await ctx.db
//       .query("attendanceSession")
//       .withIndex("by_classroom", (q) => q.eq("classroomId", args.classroomId))
//       .collect();

//     const allAttendance = await Promise.all(
//       sessions.map((s) =>
//         ctx.db
//           .query("attendance")
//           .withIndex("by_session_user", (q) => q.eq("sessionId", s._id))
//           .collect()
//       )
//     );

//     const flatAttendance = allAttendance.flat();

//     const attendanceMap = new Map<string, Set<string>>();
//     for (const att of flatAttendance) {
//       if (!attendanceMap.has(att.sessionId)) {
//         attendanceMap.set(att.sessionId, new Set());
//       }
//       attendanceMap.get(att.sessionId)!.add(att.userId);
//     }

//     // ดึงข้อมูลสมาชิกในห้องเรียน
//     const classroomStudents = await ctx.db
//       .query("classroomMembers")
//       .withIndex("by_classroom_id", (q) => q.eq("classroomId", args.classroomId))
//       .collect();

//     // ดึงข้อมูลผู้ใช้ที่เชื่อมโยงกับ classroomMembers ทีละตัว
//     const studentsInClass: Array<any> = [];
//     for (const member of classroomStudents) {
//       const user = await ctx.db
//         .query("users")
//         .withIndex("by_id", (q) => q.eq("_id", member.userId))
//         .first();

//       if (user && user.role === "student") {
//         studentsInClass.push(user);
//       }
//     }

//     const totalStudents = studentsInClass.length;

//     const totalScore = submissions.reduce((sum, s) => sum + (s.score ?? 0), 0);

//     const attendanceStatusSummary = {
//       present: flatAttendance.filter((a) => a.status === "present").length,
//       late: flatAttendance.filter((a) => a.status === "late").length,
//       leave: flatAttendance.filter((a) => a.status === "leave").length,
//       absent: flatAttendance.filter((a) => a.status === "absent").length,
//     };

//     return {
//       totalStudents,                    // จำนวนนักเรียน
//       studentsSubmittedCount,          // นักเรียนที่ส่งงาน
//       totalAssignments: assignments.length,
//       assignmentsWithNoSubmissions,
//       submitStatusSummary,
//       totalScore,
//       attendanceSessions: sessions.length,        // จำนวนครั้งที่เช็คชื่อ
//       totalAttendanceRecords: flatAttendance.length, // จำนวนการเช็คชื่อทั้งหมด
//       attendanceStatusSummary,         // สรุปสถานะการเข้าเรียน
//     };
//   },
// });


export const getClassroomOverviewForTeacher = query({
  args: {
    classroomId: v.id("classrooms"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    if (!userId) {
      throw new Error("Unauthorized");
    }

    // ตรวจสอบสิทธิ์ครู
    const member = await ctx.db
      .query("users")
      .withIndex("by_id", (q) => q.eq("_id", userId))
      .first();

    if (!member || member.role !== "teacher") {
      throw new Error("Access denied");
    }

    const assignments = await ctx.db
      .query("assignments")
      .withIndex("by_classroom_id", (q) => q.eq("classroomId", args.classroomId))
      .collect();

    const submissions = await ctx.db
      .query("submitAssignments")
      .withIndex("by_classroom_id", (q) => q.eq("classroomId", args.classroomId))
      .collect();

    const submittedStudents = new Set(submissions.map((s) => s.userId));
    const studentsSubmittedCount = submittedStudents.size;

    const assignmentsWithNoSubmissions = assignments.filter(
      (a) => !submissions.find((s) => s.assignmentId === a._id)
    );

    const submitStatusSummary = {
      submitted: submissions.filter((s) => s.status === "submitted").length,
      late: submissions.filter((s) => s.status === "late").length,
      canResubmit: submissions.filter((s) => s.status === "canResubmit").length,
    };

    const sessions = await ctx.db
      .query("attendanceSession")
      .withIndex("by_classroom", (q) => q.eq("classroomId", args.classroomId))
      .collect();

    const allAttendance = await Promise.all(
      sessions.map((s) =>
        ctx.db
          .query("attendance")
          .withIndex("by_session_user", (q) => q.eq("sessionId", s._id))
          .collect()
      )
    );

    const flatAttendance = allAttendance.flat();

    const attendanceMap = new Map<string, Set<string>>();
    for (const att of flatAttendance) {
      if (!attendanceMap.has(att.sessionId)) {
        attendanceMap.set(att.sessionId, new Set());
      }
      attendanceMap.get(att.sessionId)!.add(att.userId);
    }

    // ดึงข้อมูลสมาชิกในห้องเรียน
    const classroomStudents = await ctx.db
      .query("classroomMembers")
      .withIndex("by_classroom_id", (q) => q.eq("classroomId", args.classroomId))
      .collect();

    const studentsInClass: Array<any> = [];
    for (const member of classroomStudents) {
      const user = await ctx.db
        .query("users")
        .withIndex("by_id", (q) => q.eq("_id", member.userId))
        .first();

      if (user && user.role === "student") {
        studentsInClass.push(user);
      }
    }

    const totalStudents = studentsInClass.length;

    const totalScore = submissions.reduce((sum, s) => sum + (s.score ?? 0), 0);

    const attendanceStatusSummary = {
      present: flatAttendance.filter((a) => a.status === "present").length,
      late: flatAttendance.filter((a) => a.status === "late").length,
      leave: flatAttendance.filter((a) => a.status === "leave").length,

      absent: studentsInClass.reduce((totalAbsent, student) => {
        const studentAttendanceMap = new Map(
          flatAttendance
            .filter((a) => a.userId === student._id)
            .map((a) => [a.sessionId, a.status])
        );

        // ตรวจแต่ละ session ว่ามีนักเรียนคนนี้ไหม
        const studentAbsentCount = sessions.reduce((count, session) => {
          const status = studentAttendanceMap.get(session._id);
          if (!status || status === "absent") {
            return count + 1; // ไม่มาเลย หรือติด absent
          }
          return count;
        }, 0);

        return totalAbsent + studentAbsentCount;
      }, 0),
    };


    return {
      totalStudents,
      studentsSubmittedCount,
      totalAssignments: assignments.length,
      assignmentsWithNoSubmissions,
      submitStatusSummary,
      totalScore,
      attendanceSessions: sessions.length,
      totalAttendanceRecords: flatAttendance.length,
      attendanceStatusSummary,
    };
  },
});
