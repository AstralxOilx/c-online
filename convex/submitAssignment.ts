import { v } from "convex/values";
import { mutation, query, QueryCtx } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { paginationOptsValidator } from "convex/server";
import { getAuthUserId } from "@convex-dev/auth/server";

const getMember = async (ctx: QueryCtx, classroomId: Id<"classrooms">, userId: Id<"users">) => {
  return ctx.db
    .query("classroomMembers")
    .withIndex("by_classroom_id_user_id", (q) => q.eq("classroomId", classroomId).eq("userId", userId))
    .unique();
}


export const checkedSubmitAssignment = mutation({
  args: {
    submitAssignmentId: v.id("submitAssignments"),
    score: v.number(),
    feedback: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    if (!userId) {
      throw new Error("Unauthorized");
    }

    await ctx.db.patch(args.submitAssignmentId, {
      isChecked: true,
      score: args.score,
      feedback: args.feedback,
    });
  }
});


export const createSubmitAssignment = mutation({
  args: {
    assignmentId: v.id("assignments"),
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

    const workspace = await ctx.db.get(args.classroomId);
    if (!workspace) throw new Error("ไม่พบ ห้องเรียนนี้!");



    // ✅ ตรวจสอบว่ามีการส่งงานแล้วหรือยัง
    const existingSubmission = await ctx.db
      .query("submitAssignments")
      .withIndex("by_assignment_user", (q) =>
        q.eq("assignmentId", args.assignmentId).eq("userId", userId)
      )
      .unique();

    if (existingSubmission) {
      throw new Error("[ALREADY_SUBMITTED] คุณได้ส่งการบ้านนี้ไปแล้ว");
    }

    const assignment = await ctx.db.get(args.assignmentId);
    if (!assignment) {
      throw new Error("ไม่พบการบ้านนี้!");
    }

    const now = new Date();
    const dueDate = new Date(assignment.dueDate);

    //  console.log(now)

    const isLate = now >= dueDate;
    const status = isLate ? "late" : "submitted";

    const submitAssignmentId = await ctx.db.insert("submitAssignments", {
      assignmentId: args.assignmentId,
      classroomId: args.classroomId,
      userId: userId,
      status,
      isChecked: false,
    });

    for (const file of args.files) {
      await ctx.db.insert("submitFiles", {
        name: file.name,
        file: file.storageId,
        submitAssignmentId,
      });
    }
  }
});

export const allowResubmission = mutation({
  args: {
    submitAssignmentId: v.id("submitAssignments"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    if (!userId) {
      throw new Error("Unauthorized");
    }

    const submit = await ctx.db.get(args.submitAssignmentId);
    if (!submit) throw new Error("ไม่พบข้อมูลการส่งงาน");

    const assignment = await ctx.db.get(submit.assignmentId);
    if (!assignment) throw new Error("ไม่พบการบ้าน");

    // ดึงไฟล์ทั้งหมดที่แนบมากับการส่งงานนี้
    const files = await ctx.db
      .query("submitFiles")
      .withIndex("by_submitAssignments_id", (q) =>
        q.eq("submitAssignmentId", args.submitAssignmentId)
      )
      .collect();

    // ลบไฟล์ใน _storage (ถ้ามีไฟล์แนบ)
    for (const file of files) {
      if (file.file) {
        await ctx.storage.delete(file.file); // ลบไฟล์จาก storage
      }

      // ลบ record ใน submitFiles
      await ctx.db.delete(file._id);
    }


    // เปลี่ยนสถานะเป็นส่งใหม่ได้
    await ctx.db.patch(args.submitAssignmentId, {
      status: "canResubmit",
      canResubmit: true,
      isChecked: false,
      score: 0,
      feedback: "ให้นักเรียนส่งงานที่หมอบหมายนี้ใหม่"
    });



    await ctx.db.insert("notifications", {
      userId: submit.userId,
      classroomId: submit.classroomId,
      type: "resubmit-allowed",
      title: `สามารถส่งการบ้านใหม่ได้: ${assignment.name}`,
      description: "คุณได้รับสิทธิ์ในการส่งการบ้านใหม่อีกครั้ง",
      data: {
        assignmentId: assignment._id,
        submitAssignmentId: submit._id,
      },
      read: false,
      createdAt: new Date().toISOString(),
    });

  },
});


export const resubmitAssignment = mutation({
  args: {
    submitAssignmentId: v.id("submitAssignments"),
    files: v.array(
      v.object({
        name: v.string(),
        storageId: v.id("_storage"),
      })
    ),
  },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);

    if (!currentUserId) {
      throw new Error("Unauthorized");
    }


    const members = await ctx.db
      .query("classroomMembers")
      .withIndex("by_user_id", (q) => q.eq("userId", currentUserId))
      .collect();



    if (!members) {
      throw new Error("Unauthorized");
    }


    const submit = await ctx.db.get(args.submitAssignmentId);
    if (!submit) throw new Error("ไม่พบข้อมูลการส่งงาน");

    // ✅ เช็คว่าอนุญาตให้ส่งใหม่ได้
    if (submit.status !== "canResubmit") {
      throw new Error("ไม่สามารถส่งใหม่ได้ในขณะนี้");
    }

    //  ลบไฟล์เดิม (ถ้ามี)
    const oldFiles = await ctx.db
      .query("submitFiles")
      .withIndex("by_submitAssignments_id", (q) =>
        q.eq("submitAssignmentId", args.submitAssignmentId)
      )
      .collect();

    for (const file of oldFiles) {
      if (file.file) {
        await ctx.storage.delete(file.file);
      }
      await ctx.db.delete(file._id);
    }

    //  เพิ่มไฟล์ใหม่
    for (const newFile of args.files) {
      await ctx.db.insert("submitFiles", {
        submitAssignmentId: args.submitAssignmentId,
        name: newFile.name,
        file: newFile.storageId,
      });
    }

    await ctx.db.patch(args.submitAssignmentId, {
      status: "submitted",
      canResubmit: false,
    });

    return args.submitAssignmentId;
  },
});



export const getExistingSubmissionByUserId = query({
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
    if (!workspace) throw new Error("ไม่พบ ห้องเรียนนี้!");

    const member = await ctx.db
      .query("classroomMembers")
      .withIndex("by_classroom_id_user_id", (q) =>
        q.eq("classroomId", args.classroomId).eq("userId", userId),
      )
      .unique();

    if (!member) {
      return;
    }

    const existingSubmission = await ctx.db
      .query("submitAssignments")
      .withIndex("by_assignment_user", (q) =>
        q.eq("assignmentId", args.assignmentId).eq("userId", member.userId)
      )
      .unique();

    // ✅ ถ้าส่งแล้ว return true
    if (existingSubmission) {
      return true;
    }

    // ✅ ถ้ายังไม่ส่ง return false
    return false;
  }
});

export const getSubmitAssignmentById = query({
  args: {
    submitAssignmentId: v.id("submitAssignments"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    if (!userId) {
      throw new Error("Unauthorized");
    }

    // ดึงข้อมูล submitAssignment
    const submitAssignment = await ctx.db.get(args.submitAssignmentId);

    if (!submitAssignment) {
      return {
        submitAssignment: null,
        submitFiles: [],
        feedback: null,
        submitUser: null,
        assignment: null,
      };
    }

    // ดึงข้อมูลของผู้ส่งงาน
    const submitUser = await ctx.db.get(submitAssignment.userId);

    // ดึงข้อมูล Assignment (ชื่อของงาน)
    const assignment = await ctx.db.get(submitAssignment.assignmentId);

    // ดึงไฟล์แนบ
    const submitFiles = await ctx.db
      .query("submitFiles")
      .withIndex("by_submitAssignments_id", (q) =>
        q.eq("submitAssignmentId", submitAssignment._id)
      )
      .collect();



    return {
      submitAssignment,
      submitFiles,
      submitUser,
      assignment, // 📝 เพิ่ม assignment object เข้าไป
    };
  },
});



export const getSubmitAssignmentForMember = query({
  args: {
    assignmentId: v.id("assignments"),
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

    // ค้นหาการส่งงานของผู้ใช้คนนั้นสำหรับ assignment นี้
    const submitAssignment = await ctx.db
      .query("submitAssignments")
      .withIndex("by_assignment_user", q =>
        q.eq("assignmentId", args.assignmentId).eq("userId", userId)
      )
      .unique();

    if (!submitAssignment) {
      return {
        submitted: false,
        message: "ยังไม่ได้ส่งงาน",
        submitAssignment: null,
      };
    }

    // ดึงไฟล์ที่ส่ง
    const submitFiles = await ctx.db
      .query("submitFiles")
      .withIndex("by_submitAssignments_id", q =>
        q.eq("submitAssignmentId", submitAssignment._id)
      )
      .collect();


    return {
      submitted: true,
      submitAssignment,
      submitFiles,
    };
  },
});


export const get = query({
  args: {
    assignmentId: v.id("assignments"),
    paginationOpts: paginationOptsValidator,
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
      // Return PaginationResult ที่ว่างเปล่า และกำหนด continueCursor เป็น string ว่าง
      return {
        page: [],
        isDone: true,
        continueCursor: "",
      };
    }

    const results = await ctx.db
      .query("submitAssignments")
      .withIndex("by_classroom_id_and_assignment_id", (q) =>
        q.eq("classroomId", assignment.classroomId).eq("assignmentId", args.assignmentId)
      )
      .order("desc")
      .paginate(args.paginationOpts ?? {});


    // ตรวจสอบผลลัพธ์ว่าไม่เป็น null
    const fixedResults = results ? results : { page: [], isDone: true, continueCursor: "" };

    // เพิ่มข้อมูลของผู้ที่ส่งการบ้าน (ดึงข้อมูลผู้ใช้ และไฟล์ที่ส่ง)
    const resultsWithUserData = await Promise.all(
      fixedResults.page.map(async (result) => {
        // ดึงข้อมูลผู้ที่ส่งการบ้าน (จากตาราง users)
        const user = await ctx.db.get(result.userId);

        // ดึงข้อมูลไฟล์ที่ส่งมา
        const submitFiles = await ctx.db
          .query("submitFiles")
          .withIndex("by_submitAssignments_id", (q) =>
            q.eq("submitAssignmentId", result._id)
          )
          .collect();

        // สร้าง URL ของไฟล์ที่ส่งมา
        const filesWithUrl = await Promise.all(
          submitFiles.map(async (fileDoc) => {
            const url = fileDoc.file ? await ctx.storage.getUrl(fileDoc.file) : undefined;
            return {
              ...fileDoc,
              url,
            };
          })
        );

        // รวมข้อมูลผู้ใช้เข้าไปในผลลัพธ์
        return {
          ...result,
          user,  // เพิ่มข้อมูลผู้ใช้
          files: filesWithUrl,
        };
      })
    );

    return {
      ...fixedResults,
      page: resultsWithUserData,
    };
  }
});
