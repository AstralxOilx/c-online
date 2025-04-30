import { v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { mutation, query, QueryCtx } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";


const getMember = async (ctx: QueryCtx, classroomId: Id<"classrooms">, userId: Id<"users">) => {
    return ctx.db
        .query("classroomMembers")
        .withIndex("by_classroom_id_user_id", (q) => q.eq("classroomId", classroomId).eq("userId", userId))
        .unique();
}

const getFiles = async (ctx: QueryCtx, assignmentId: Id<"assignments">) => {
    const files = await ctx.db
        .query("files")
        .withIndex("by_assignment_id", (q) =>
            q.eq("assignmentId", assignmentId)
        )
        .collect();

    const filesWithUrl = await Promise.all(
        files.map(async (fileDoc) => {
            const url = fileDoc.file
                ? await ctx.storage.getUrl(fileDoc.file)
                : undefined;
            return {
                ...fileDoc,
                url,
            };
        })
    );

    return filesWithUrl;
}

export const getById = query({
    args: {
        id: v.id("assignments")
    },
    handler: async (ctx, args) => {

        const userId = await getAuthUserId(ctx);

        if (!userId) {
            throw new Error("Unauthorized");
        }

        const assignment = await ctx.db.get(args.id);

        if (!assignment) {
            throw new Error("ไม่พบข้อมูล งานที่หมอบหมาย!");
        }

        const currentMember = await getMember(ctx, assignment.classroomId, userId);

        if (!currentMember) {
            return null;
        }

        const filesWithUrl = await getFiles(ctx, args.id)


        return {
            ...assignment,
            files: await Promise.all(
                filesWithUrl.map(async (file) => ({
                    id: file._id,
                    name: file.name,
                    url: file.url // ต้องใส่ f.url หรือเรียกจาก f ด้วย
                }))
            )
        };

    }
})


export const createAssignmentWithFiles = mutation({
    args: {
        name: v.string(),
        description: v.string(),
        score: v.number(),
        publish: v.boolean(),
        dueDate: v.string(),
        classroomId: v.id("classrooms"),
        files: v.array(v.object({
            name: v.string(),
            storageId: v.id("_storage"),
        })),
    },
    handler: async (ctx, args) => {

        const userId = await getAuthUserId(ctx);

        if (!userId) {
            throw new Error("Unauthorized");
        }

        const classroom = await ctx.db.get(args.classroomId);

        if (!classroom) throw new Error("ไม่พบ ห้องเรียนนี้!");

        const member = await ctx.db
            .query("classroomMembers")
            .withIndex("by_classroom_id_user_id", (q) => q.eq("classroomId", args.classroomId).eq("userId", userId),)
            .unique();

        const role = await ctx.db.get(userId);



        if (!member || !role || role?.role !== "teacher") {
            throw new Error("Unauthorized");
        }

        const assignmentId = await ctx.db.insert("assignments", {
            name: args.name,
            description: args.description,
            score: args.score,
            publish: args.publish,
            dueDate: args.dueDate,
            classroomId: args.classroomId,
        });

        for (const file of args.files) {
            await ctx.db.insert("files", {
                name: file.name,
                assignmentId,
                file: file.storageId,
            });
        }
    }
});


export const getPrivate = query({
    args: {
        classroomId: v.id("classrooms"),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);

        if (!userId) {
            throw new Error("Unauthorized");
        }

        // ดึงข้อมูลการบ้านจากฐานข้อมูลตาม classroomId
        const assignments = await ctx.db
            .query("assignments")
            .withIndex("by_classroom_id_and_publish", (q) =>
                q.eq("classroomId", args.classroomId).eq("publish", false)
            )
            .order("desc") // สามารถเปลี่ยนได้ตามต้องการ (order by date, name, etc.)
            .collect(); // ใช้ collect แทนการใช้งาน .page

        // ถ้าไม่พบข้อมูลการบ้าน
        if (!assignments || assignments.length === 0) {
            return {
                assignments: [],
            };
        }

        // ดึงจำนวนคนที่ส่งการบ้านในแต่ละการบ้าน
        const assignmentsWithSubmissionCount = await Promise.all(
            assignments.map(async (assignment) => {
                // ดึงข้อมูลการบ้านที่มีการส่งแล้ว (เชื่อมโยงกับ submitAssignments)
                const submissions = await ctx.db
                    .query("submitAssignments")
                    .withIndex("by_assignment_user", (q) =>
                        q.eq("assignmentId", assignment._id)
                    )
                    .collect(); // ใช้ collect เพื่อดึงข้อมูลทั้งหมดที่เกี่ยวข้อง

                const submitCount = submissions.length; // นับจำนวนของการส่งการบ้าน

                // ดึงไฟล์ที่เชื่อมโยงกับการบ้าน
                const files = await ctx.db
                    .query("files")
                    .withIndex("by_assignment_id", (q) =>
                        q.eq("assignmentId", assignment._id)
                    )
                    .collect(); // ดึงข้อมูลไฟล์ที่เชื่อมโยงกับการบ้านนี้

                // เชื่อมโยงข้อมูลไฟล์ให้มี URL
                const filesWithUrl = await Promise.all(
                    files.map(async (fileDoc) => {
                        const url = fileDoc.file
                            ? await ctx.storage.getUrl(fileDoc.file)
                            : undefined;
                        return {
                            ...fileDoc,
                            url,
                        };
                    })
                );

                // เพิ่มข้อมูลจำนวนคนที่ส่งการบ้าน และไฟล์ในแต่ละการบ้าน
                return {
                    ...assignment,
                    submitCount,  // เพิ่มจำนวนคนที่ส่งการบ้าน
                    files: filesWithUrl,
                };
            })
        );

        // คืนค่าการบ้านที่รวมไฟล์และจำนวนคนที่ส่งการบ้าน
        return {
            assignments: assignmentsWithSubmissionCount,
        };
    }
});



export const getPublic = query({
    args: {
        classroomId: v.id("classrooms"),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);

        if (!userId) {
            throw new Error("Unauthorized");
        }

        // ดึงข้อมูลการบ้านจากฐานข้อมูลตาม classroomId
        const assignments = await ctx.db
            .query("assignments")
            .withIndex("by_classroom_id_and_publish", (q) =>
                q.eq("classroomId", args.classroomId).eq("publish", true)
            )
            .order("desc") // สามารถเปลี่ยนได้ตามต้องการ (order by date, name, etc.)
            .collect(); // ใช้ collect แทนการใช้งาน .page

        // ถ้าไม่พบข้อมูลการบ้าน
        if (!assignments || assignments.length === 0) {
            return {
                assignments: [],
            };
        }

        // ดึงจำนวนคนที่ส่งการบ้านในแต่ละการบ้าน
        const assignmentsWithSubmissionCount = await Promise.all(
            assignments.map(async (assignment) => {
                // ดึงข้อมูลการบ้านที่มีการส่งแล้ว (เชื่อมโยงกับ submitAssignments)
                const submissions = await ctx.db
                    .query("submitAssignments")
                    .withIndex("by_assignment_user", (q) =>
                        q.eq("assignmentId", assignment._id)
                    )
                    .collect(); // ใช้ collect เพื่อดึงข้อมูลทั้งหมดที่เกี่ยวข้อง

                const submitCount = submissions.length; // นับจำนวนของการส่งการบ้าน

                // ดึงไฟล์ที่เชื่อมโยงกับการบ้าน
                const files = await ctx.db
                    .query("files")
                    .withIndex("by_assignment_id", (q) =>
                        q.eq("assignmentId", assignment._id)
                    )
                    .collect(); // ดึงข้อมูลไฟล์ที่เชื่อมโยงกับการบ้านนี้

                // เชื่อมโยงข้อมูลไฟล์ให้มี URL
                const filesWithUrl = await Promise.all(
                    files.map(async (fileDoc) => {
                        const url = fileDoc.file
                            ? await ctx.storage.getUrl(fileDoc.file)
                            : undefined;
                        return {
                            ...fileDoc,
                            url,
                        };
                    })
                );

                // เพิ่มข้อมูลจำนวนคนที่ส่งการบ้าน และไฟล์ในแต่ละการบ้าน
                return {
                    ...assignment,
                    submitCount,  // เพิ่มจำนวนคนที่ส่งการบ้าน
                    files: filesWithUrl,
                };
            })
        );

        // คืนค่าการบ้านที่รวมไฟล์และจำนวนคนที่ส่งการบ้าน
        return {
            assignments: assignmentsWithSubmissionCount,
        };
    }
});

export const upDateDataText = mutation({
    args: {
        id: v.id("assignments"),
        name: v.string(),
        description: v.string(),
        score: v.number(),
        publish: v.boolean(),
        dueDate: v.string(),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);

        if (!userId) {
            throw new Error("Unauthorized");
        }

        const assignment = await ctx.db.get(args.id);

        if (!assignment) {
            throw new Error("ไม่พบข้อมูล งานที่หมอบหมาย!");
        }

        const currentMember = await getMember(ctx, assignment.classroomId, userId);

        if (!currentMember) {
            return null;
        }

        await ctx.db.patch(args.id, {
            name: args.name,
            description: args.description,
            score: args.score,
            publish: args.publish,
            dueDate: args.dueDate,
        });

        return args.id;
    }
});


export const upDateFile = mutation({
    args: {
        assignmentId: v.id("assignments"),
        files: v.array(v.object({
            name: v.string(),
            storageId: v.id("_storage"),
        })),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);

        if (!userId) {
            throw new Error("Unauthorized");
        }

        const assignment = await ctx.db.get(args.assignmentId);

        if (!assignment) {
            throw new Error("ไม่พบข้อมูล งานที่หมอบหมาย!");
        }

        const currentMember = await getMember(ctx, assignment.classroomId, userId);

        if (!currentMember) {
            return null;
        }

        for (const file of args.files) {
            await ctx.db.insert("files", {
                name: file.name,
                assignmentId: args.assignmentId,
                file: file.storageId,
            });
        }

        return;
    }
});


export const removeFile = mutation({
    args: {
        id: v.id("files"),
        assignmentId: v.id("assignments"),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);

        if (!userId) {
            throw new Error("Unauthorized");
        }

        const message = await ctx.db.get(args.id);

        if (!message) {
            throw new Error("ไม่พบข้อความนี้!");
        }
        const assignment = await ctx.db.get(args.assignmentId);

        if (!assignment) {
            throw new Error("ไม่พบข้อมูล งานที่หมอบหมาย!");
        }

        const currentMember = await getMember(ctx, assignment.classroomId, userId);

        if (!currentMember) {
            return null;
        }

        const file = await ctx.db.get(args.id);

        if (!file) {
            throw new Error("ไม่พบไฟล์นี้!");
        }


        if (file.file) {
            await ctx.storage.delete(file.file);
        }

        await ctx.db.delete(args.id);

        return args.id;

    }
});



export const removeAssign = mutation({
    args: {
      assignmentId: v.id("assignments"),
      classroomId: v.id("classrooms"),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);

        if (!userId) {
            throw new Error("Unauthorized");
        }
  
      const workspace = await ctx.db.get(args.classroomId);
      if (!workspace) throw new Error("ไม่พบห้องเรียนนี้!");
  
     
  
      // ✅ ลบไฟล์ของ assignment
      const files = await ctx.db
        .query("files")
        .withIndex("by_assignment_id", (q) => q.eq("assignmentId", args.assignmentId))
        .collect();
  
      for (const file of files) {
        if (file.file) {
          await ctx.storage.delete(file.file);
        }
        await ctx.db.delete(file._id);
      }
  
      // ✅ ลบ submitAssignments และไฟล์ที่ส่ง
      const submissions = await ctx.db
        .query("submitAssignments")
        .withIndex("by_classroom_id_and_assignment_id", (q) =>
          q.eq("classroomId", args.classroomId).eq("assignmentId", args.assignmentId)
        )
        .collect();
  
      for (const submission of submissions) {
        // ลบ submitFiles
        const submitFiles = await ctx.db
          .query("submitFiles")
          .withIndex("by_submitAssignments_id", (q) =>
            q.eq("submitAssignmentId", submission._id)
          )
          .collect();
  
        for (const file of submitFiles) {
          if (file.file) {
            await ctx.storage.delete(file.file);
          }
          await ctx.db.delete(file._id);
        }
   
        await ctx.db.delete(submission._id); // ลบ submitAssignment
      }
  
      // ✅ ลบ assignment
      await ctx.db.delete(args.assignmentId);
    },
  });


  export const getStudentAssignments = query({
  args: {
    classroomId: v.id("classrooms"), // กำหนด argument สำหรับ classroomId
  },
  handler: async (ctx, args) => {
    // ตรวจสอบว่า userId เป็นผู้ใช้ที่ได้รับอนุญาตหรือไม่
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Unauthorized");
    }

    // 1. ดึงการบ้านที่เผยแพร่แล้ว (publish = true) ของห้องเรียนนี้
    const publishedAssignments = await ctx.db
      .query("assignments")
      .withIndex("by_classroom_id_and_publish", (q) => 
        q.eq("classroomId", args.classroomId).eq("publish", true)
      )
      .collect();

    // 2. ดึงข้อมูลการส่งงานของนักเรียนคนนี้
    const submittedAssignments = await ctx.db
      .query("submitAssignments")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .collect();

    const submittedAssignmentIds = new Set(
      submittedAssignments.map((s) => s.assignmentId)
    );

    // เตรียม map assignmentId -> submitAssignment
    const submitAssignmentMap = new Map(
      submittedAssignments.map((submit) => [submit.assignmentId, submit])
    );

    // 3. แยก assignment เป็น 2 กลุ่ม
    const submitted = publishedAssignments
      .filter((assignment) => submittedAssignmentIds.has(assignment._id))
      .map((assignment) => {
        const submitData = submitAssignmentMap.get(assignment._id);
        return {
          assignmentId: assignment._id,
          name: assignment.name,
          description: assignment.description,
          dueDate: assignment.dueDate,
          fullScore: assignment.score, // คะแนนเต็ม
          score: submitData?.score ?? null, // คะแนนที่ได้
          status: submitData?.status ?? null, // สถานะ (submitted, late, canResubmit)
        };
      });

    const notSubmitted = publishedAssignments
      .filter((assignment) => !submittedAssignmentIds.has(assignment._id))
      .map((assignment) => ({
        assignmentId: assignment._id,
        name: assignment.name,
        description: assignment.description,
        dueDate: assignment.dueDate,
        fullScore: assignment.score, // คะแนนเต็ม
        score: null, // ยังไม่ได้ส่ง
        status: "ยังไม่ส่ง", // กำหนดเป็น "ยังไม่ส่ง"
      }));

    return {
      submitted,
      notSubmitted,
    };
  },
});


export const getClassroomAssignmentsScores = query({
    args: {
      classroomId: v.id("classrooms"), // ห้องเรียนที่ต้องการดึงข้อมูล
    },
    handler: async (ctx, args) => {
      // 1. ดึงการบ้านทั้งหมดของห้องเรียนนี้ที่เผยแพร่แล้ว
      const allAssignments = await ctx.db
        .query("assignments")
        .withIndex("by_classroom_id_and_publish", (q) =>
          q.eq("classroomId", args.classroomId).eq("publish", true)
        )
        .collect();
  
      // 2. ดึงข้อมูลการส่งงานทั้งหมดของห้องเรียนนี้
      const allSubmitAssignments = await ctx.db
        .query("submitAssignments")
        .withIndex("by_classroom_id", (q) => q.eq("classroomId", args.classroomId))
        .collect();
  
      // 3. ดึงเฉพาะสมาชิกของห้องเรียนนี้ที่สถานะเป็น "active"
      const classroomMembers = await ctx.db
        .query("classroomMembers")
        .withIndex("by_classroom_id_status", (q) =>
          q.eq("classroomId", args.classroomId).eq("status", "active")
        )
        .collect();
  
      const studentIds = classroomMembers.map((member) => member.userId);
  
      // 4. ดึงข้อมูลผู้ใช้ทั้งหมด และกรองเฉพาะผู้ที่เป็นนักเรียน และอยู่ในห้องเรียนนี้
      const allUsers = await ctx.db.query("users").collect();
      const students = allUsers.filter(
        (user) => user.role === "student" && studentIds.includes(user._id)
      );
  
      // 5. สร้างแผนที่ assignmentId -> รายการการส่งงาน
      const assignmentSubmissionsMap = new Map(
        allSubmitAssignments.map((submit) => [submit.assignmentId, submit])
      );
  
      // 6. สร้างข้อมูลรวมคะแนนของนักเรียนทั้งหมด
      const classroomScores = allAssignments.map((assignment) => {
        // ตรวจสอบการส่งงานแต่ละการบ้าน
        const submissions = students.map((student) => {
          // ค้นหาการส่งงานสำหรับนักเรียน
          const submit = allSubmitAssignments.find(
            (s) => s.assignmentId === assignment._id && s.userId === student._id
          );
  
          return {
            userId: student._id,
            studentName: `${student.fname} ${student.lname}`,
            score: submit?.score ?? 0,
            status: submit?.status ?? "ยังไม่ส่ง",
          };
        });
  
        return {
          assignmentName: assignment.name,
          assignmentId: assignment._id,
          dueDate: assignment.dueDate,
          fullScore: assignment.score,
          submissions,
        };
      });
  
      return classroomScores;
    },
  });
  
  