import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

const schema = defineSchema({
   ...authTables,
   users: defineTable({
      // ข้อมูลทั่วไป
      fname: v.string(),
      lname: v.string(),
      image:  v.optional(v.id("_storage")),

      // การเข้าสู่ระบบ
      email: v.string(),
      emailVerificationTime: v.optional(v.number()),
      phone: v.optional(v.string()),
      phoneVerificationTime: v.optional(v.number()),
      isAnonymous: v.optional(v.boolean()),
      gender: v.optional(v.string()),
      // การยืนยันตัวตน
      identificationCode: v.string(),

      // บทบาทในระบบ
      role: v.union(
         v.literal("student"),
         v.literal("teacher"),
         v.literal("admin")
      ),

      updatedAt: v.optional(v.number()),
   })
      // ทำให้อีเมลต้องไม่ซ้ำกัน
      .index("email", ["email"]),


   classrooms: defineTable({
      name: v.string(),
      userId: v.id("users"),
      joinCode: v.string(),
   })
   .index("by_join_code", ["joinCode"]),
   classroomMembers: defineTable({
      userId: v.id("users"),
      classroomId: v.id("classrooms"),
      status: v.union(
         v.literal("owner"),     // เจ้าของ/ผู้สร้างห้อง
         v.literal("active"),    // สมาชิกทั่วไป
         v.literal("pending"),   // รอการอนุมัติ
         v.literal("inactive")    // ถูกเชิญแต่ยังไม่เข้าร่วม
      ),
   })
      .index("by_user_id", ["userId"])
      .index("by_classroom_id", ["classroomId"])
      .index("by_classroom_id_status", ["classroomId", "status"])
      .index("by_classroom_id_user_id", ["classroomId", "userId"]),
   channels: defineTable({
      name: v.string(),
      general: v.boolean(),
      classroomId: v.id("classrooms"),
   })
      .index("by_classroom_id", ["classroomId"])
      .index("by_classroom_id_general", ["classroomId", "general"]),
   channelMembers: defineTable({
      userId: v.id("users"),
      channelId: v.id("channels"),
      status: v.union(
         v.literal("owner"),     // เจ้าของ/ผู้สร้างห้อง
         // v.literal("assistant"),    // ผู้ช่วยครู
         v.literal("active"),    // สมาชิกทั่วไป
         v.literal("pending"),   // รอการอนุมัติ
         v.literal("inactive")    // ถูกเชิญแต่ยังไม่เข้าร่วม
      ),
   })
      .index("by_user_id", ["userId"])
      .index("by_channel_id", ["channelId"])
      .index("by_channel_id_status", ["channelId", "status"])
      .index("by_user_id_channel_id", ["userId", "channelId"]),


   conversations: defineTable({
      channelId: v.id("channels"),
      menubarOneId: v.id("channelMembers"),
      menubarTwoId: v.id("channelMembers"),
   })
      .index("by_channel_id", ["channelId"]),
   messages: defineTable({
      body: v.string(),
      image: v.optional(v.id("_storage")),
      channelMemberId: v.id("channelMembers"),
      classroomId: v.id("classrooms"),
      channelId: v.id("channels"),
      parentMessageId: v.optional(v.id("messages")),
      conversationId: v.optional(v.id("conversations")),
      updatedAt: v.optional(v.number()),
   })
      .index("by_classroom_id", ["classroomId"])
      .index("by_channelMember_id", ["channelMemberId"])
      .index("by_channel_id", ["channelId"])
      .index("by_conversation_id", ["conversationId"])
      .index("by_parent_message_id", ["parentMessageId"])
      .index("by_channel_id_parent_message_id_conversation_id",
         [
            "conversationId",
            "channelId",
            "parentMessageId",
         ]),
   reactions: defineTable({
      classroomId: v.id("classrooms"),
      messageId: v.id("messages"),
      channelMemberId: v.id("channelMembers"),
      value: v.string(),
   })
      .index("by_classroom_id", ["classroomId"])
      .index("by_message_id", ["messageId"])
      .index("by_channelMember_id", ["channelMemberId"]),

   attendanceSession: defineTable({
      classroomId: v.id("classrooms"),  // ห้องเรียนที่สร้างการเช็คชื่อ
      title: v.string(),                 // ชื่อรอบการเช็คชื่อ เช่น "คาบที่ 1"
      startTime: v.string(),             // เวลาเริ่มการเช็คชื่อ (ISO String)
      endTime: v.string(),               // เวลาสิ้นสุดการเช็คชื่อ
      endTeaching: v.string(),           // เวลาสิ้นสุดการสอน
      createdBy: v.id("users"),          // ครูที่สร้างการเช็คชื่อ
      isPublished: v.optional(v.boolean()),
   })
      .index("by_classroom", ["classroomId"])
      .index("by_classroom_id_and_startTime_and_endTime", ["classroomId", "startTime", "endTime"]),

   attendance: defineTable({
      sessionId: v.id("attendanceSession"),  // เชื่อมโยงกับตาราง attendanceSession
      userId: v.id("users"),                 // นักเรียนที่เช็คชื่อ
      description: v.optional(v.string()),    // หมายเหตุ เช่น สาเหตุลา
      status: v.union(
         v.literal("present"),
         v.literal("late"),
         v.literal("leave"),
         v.literal("absent")  // เพิ่ม absent ไว้เลยถ้าต้องการเช็คง่ายๆ
      ),
      timestamp: v.optional(v.string()),      // เวลาที่เช็คชื่อ
   })
      .index("by_session_user", ["sessionId", "userId"]),

   notifications: defineTable({
      userId: v.id("users"),
      classroomId: v.id("classrooms"),
      type: v.string(), // เช่น "new-assignment", "feedback", "announcement", etc.
      title: v.string(),
      description: v.optional(v.string()),
      data: v.optional(v.any()), // เก็บข้อมูลเพิ่มเติม เช่น assignmentId
      read: v.boolean(),
      createdAt: v.string(),
   })
      .index("by_user_id", ["userId"])
      .index("by_classroom_id", ["classroomId"]),


   assignments: defineTable({
      name: v.string(),
      description: v.string(),
      score: v.number(),
      publish: v.boolean(),
      dueDate: v.string(),
      classroomId: v.id("classrooms"),
   })
      .index("by_classroom_id", ["classroomId"])
      .index("by_classroom_id_and_publish", ["classroomId", "publish",]),
   files: defineTable({
      name: v.string(),
      assignmentId: v.id("assignments"),
      file: v.optional(v.id("_storage")),
   })
      .index("by_assignment_id", ["assignmentId"]),

   submitAssignments: defineTable({
      classroomId: v.id("classrooms"),
      assignmentId: v.id("assignments"),
      userId: v.id("users"),
      isChecked: v.boolean(),
      status: v.union(v.literal("submitted"), v.literal("late"), v.literal("canResubmit")),
      canResubmit: v.optional(v.boolean()),
      feedback: v.optional(v.string()),
      score: v.optional(v.number()),
   })
      .index("by_classroom_id", ["classroomId"])
      .index("by_classroom_id_and_assignment_id", ["classroomId", "assignmentId"])
      .index("by_user_id_and_assignment_id", ["userId", "assignmentId"])
      .index("by_user_id", ["userId"])
      .index("by_assignment_user", ["assignmentId", "userId"]),
   submitFiles: defineTable({
      name: v.string(),
      submitAssignmentId: v.id("submitAssignments"),
      file: v.optional(v.id("_storage")),
   })
      .index("by_submitAssignments_id", ["submitAssignmentId"]),
});

export default schema;