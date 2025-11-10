import { mutation, query } from "./_generated/server";
import { ConvexError, v } from "convex/values";
import { todayISO } from "./utils";

// Create a new task (Admin or Employee)
export const create = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    assignedTo: v.id("users"),
    assignedBy: v.id("users"),
    priority: v.union(
      v.literal("low"),
      v.literal("medium"),
      v.literal("high"),
      v.literal("urgent")
    ),
    dueDate: v.optional(v.string()),
    startDate: v.optional(v.string()),
    estimatedHours: v.optional(v.number()),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const assignedByUser = await ctx.db.get(args.assignedBy);
    if (!assignedByUser) {
      throw new ConvexError("Assigner not found");
    }

    const assignedToUser = await ctx.db.get(args.assignedTo);
    if (!assignedToUser) {
      throw new ConvexError("Assigned user not found");
    }

    if (assignedToUser.role !== "employee") {
      throw new ConvexError("Tasks can only be assigned to employees");
    }

    const now = Date.now();
    const taskId = await ctx.db.insert("tasks", {
      title: args.title,
      description: args.description,
      assignedTo: args.assignedTo,
      assignedBy: args.assignedBy,
      status: "pending",
      priority: args.priority,
      dueDate: args.dueDate,
      startDate: args.startDate,
      estimatedHours: args.estimatedHours,
      tags: args.tags || [],
      comments: [],
      createdAt: now,
      updatedAt: now,
    });

    return taskId;
  },
});

// Update task (Admin or assigned employee)
export const update = mutation({
  args: {
    taskId: v.id("tasks"),
    userId: v.id("users"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    assignedTo: v.optional(v.id("users")),
    status: v.optional(
      v.union(
        v.literal("pending"),
        v.literal("in-progress"),
        v.literal("completed"),
        v.literal("cancelled")
      )
    ),
    priority: v.optional(
      v.union(
        v.literal("low"),
        v.literal("medium"),
        v.literal("high"),
        v.literal("urgent")
      )
    ),
    dueDate: v.optional(v.string()),
    startDate: v.optional(v.string()),
    estimatedHours: v.optional(v.number()),
    actualHours: v.optional(v.number()),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const task = await ctx.db.get(args.taskId);
    if (!task) {
      throw new ConvexError("Task not found");
    }

    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new ConvexError("User not found");
    }

    // Check permissions: Admin can edit all, employee can only edit their own tasks
    if (user.role !== "admin" && task.assignedTo !== args.userId) {
      throw new ConvexError("You don't have permission to edit this task");
    }

    const updates: any = {
      updatedAt: Date.now(),
    };

    if (args.title !== undefined) updates.title = args.title;
    if (args.description !== undefined) updates.description = args.description;
    if (args.status !== undefined) {
      updates.status = args.status;
      if (args.status === "completed") {
        updates.completedAt = Date.now();
      }
    }
    if (args.priority !== undefined) updates.priority = args.priority;
    if (args.dueDate !== undefined) updates.dueDate = args.dueDate;
    if (args.startDate !== undefined) updates.startDate = args.startDate;
    if (args.estimatedHours !== undefined)
      updates.estimatedHours = args.estimatedHours;
    if (args.actualHours !== undefined) updates.actualHours = args.actualHours;
    if (args.tags !== undefined) updates.tags = args.tags;

    // Only admin can reassign tasks
    if (args.assignedTo !== undefined) {
      if (user.role !== "admin") {
        throw new ConvexError("Only admins can reassign tasks");
      }
      updates.assignedTo = args.assignedTo;
    }

    await ctx.db.patch(args.taskId, updates);
    return args.taskId;
  },
});

// Delete task (Admin only)
export const remove = mutation({
  args: {
    taskId: v.id("tasks"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new ConvexError("User not found");
    }

    if (user.role !== "admin") {
      throw new ConvexError("Only admins can delete tasks");
    }

    const task = await ctx.db.get(args.taskId);
    if (!task) {
      throw new ConvexError("Task not found");
    }

    await ctx.db.delete(args.taskId);
    return args.taskId;
  },
});

// Add comment to task
export const addComment = mutation({
  args: {
    taskId: v.id("tasks"),
    userId: v.id("users"),
    comment: v.string(),
  },
  handler: async (ctx, args) => {
    const task = await ctx.db.get(args.taskId);
    if (!task) {
      throw new ConvexError("Task not found");
    }

    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new ConvexError("User not found");
    }

    // Check if user has access to this task
    if (
      user.role !== "admin" &&
      task.assignedTo !== args.userId &&
      task.assignedBy !== args.userId
    ) {
      throw new ConvexError("You don't have access to this task");
    }

    const comments = task.comments || [];
    comments.push({
      userId: args.userId,
      userName: user.name,
      comment: args.comment,
      timestamp: Date.now(),
    });

    await ctx.db.patch(args.taskId, {
      comments,
      updatedAt: Date.now(),
    });

    return args.taskId;
  },
});

// Get all tasks (Admin only)
export const getAll = query({
  args: {
    userId: v.id("users"),
    status: v.optional(
      v.union(
        v.literal("pending"),
        v.literal("in-progress"),
        v.literal("completed"),
        v.literal("cancelled")
      )
    ),
    priority: v.optional(
      v.union(
        v.literal("low"),
        v.literal("medium"),
        v.literal("high"),
        v.literal("urgent")
      )
    ),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new ConvexError("User not found");
    }

    if (user.role !== "admin") {
      throw new ConvexError("Only admins can view all tasks");
    }

    let query = ctx.db.query("tasks");

    const allTasks = await query.collect();

    // Filter by status if specified
    let tasks = allTasks;
    if (args.status) {
      tasks = allTasks.filter((task) => task.status === args.status);
    }

    // Filter by priority if specified
    let filteredTasks = tasks;
    if (args.priority) {
      filteredTasks = tasks.filter((task) => task.priority === args.priority);
    }

    // Populate assigned user details
    const tasksWithUsers = await Promise.all(
      filteredTasks.map(async (task) => {
        const assignedTo = await ctx.db.get(task.assignedTo);
        const assignedBy = await ctx.db.get(task.assignedBy);
        return {
          ...task,
          assignedToName: assignedTo?.name || "Unknown",
          assignedToEmail: assignedTo?.email || "",
          assignedByName: assignedBy?.name || "Unknown",
          assignedByEmail: assignedBy?.email || "",
        };
      })
    );

    return tasksWithUsers.sort((a, b) => b.createdAt - a.createdAt);
  },
});

// Get tasks assigned to an employee
export const getMyTasks = query({
  args: {
    employeeId: v.id("users"),
    status: v.optional(
      v.union(
        v.literal("pending"),
        v.literal("in-progress"),
        v.literal("completed"),
        v.literal("cancelled")
      )
    ),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.employeeId);
    if (!user) {
      throw new ConvexError("User not found");
    }

    let query = ctx.db
      .query("tasks")
      .withIndex("by_assigned_to", (q) => q.eq("assignedTo", args.employeeId));

    const tasks = await query.collect();

    // Filter by status if specified
    let filteredTasks = tasks;
    if (args.status) {
      filteredTasks = tasks.filter((task) => task.status === args.status);
    }

    // Populate assigned by user details
    const tasksWithUsers = await Promise.all(
      filteredTasks.map(async (task) => {
        const assignedBy = await ctx.db.get(task.assignedBy);
        return {
          ...task,
          assignedByName: assignedBy?.name || "Unknown",
          assignedByEmail: assignedBy?.email || "",
        };
      })
    );

    return tasksWithUsers.sort((a, b) => b.createdAt - a.createdAt);
  },
});

// Get tasks assigned by a user (employee can see tasks they assigned)
export const getTasksAssignedByMe = query({
  args: {
    userId: v.id("users"),
    status: v.optional(
      v.union(
        v.literal("pending"),
        v.literal("in-progress"),
        v.literal("completed"),
        v.literal("cancelled")
      )
    ),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new ConvexError("User not found");
    }

    let query = ctx.db
      .query("tasks")
      .withIndex("by_assigned_by", (q) => q.eq("assignedBy", args.userId));

    const tasks = await query.collect();

    // Filter by status if specified
    let filteredTasks = tasks;
    if (args.status) {
      filteredTasks = tasks.filter((task) => task.status === args.status);
    }

    // Populate assigned to user details
    const tasksWithUsers = await Promise.all(
      filteredTasks.map(async (task) => {
        const assignedTo = await ctx.db.get(task.assignedTo);
        return {
          ...task,
          assignedToName: assignedTo?.name || "Unknown",
          assignedToEmail: assignedTo?.email || "",
        };
      })
    );

    return tasksWithUsers.sort((a, b) => b.createdAt - a.createdAt);
  },
});

// Get single task details
export const getTask = query({
  args: {
    taskId: v.id("tasks"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const task = await ctx.db.get(args.taskId);
    if (!task) {
      throw new ConvexError("Task not found");
    }

    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new ConvexError("User not found");
    }

    // Check permissions
    if (
      user.role !== "admin" &&
      task.assignedTo !== args.userId &&
      task.assignedBy !== args.userId
    ) {
      throw new ConvexError("You don't have access to this task");
    }

    const assignedTo = await ctx.db.get(task.assignedTo);
    const assignedBy = await ctx.db.get(task.assignedBy);

    return {
      ...task,
      assignedToName: assignedTo?.name || "Unknown",
      assignedToEmail: assignedTo?.email || "",
      assignedByName: assignedBy?.name || "Unknown",
      assignedByEmail: assignedBy?.email || "",
    };
  },
});

// Get task statistics
export const getTaskStats = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new ConvexError("User not found");
    }

    let tasks;
    if (user.role === "admin") {
      tasks = await ctx.db.query("tasks").collect();
    } else {
      tasks = await ctx.db
        .query("tasks")
        .withIndex("by_assigned_to", (q) => q.eq("assignedTo", args.userId))
        .collect();
    }

    const stats = {
      total: tasks.length,
      pending: tasks.filter((t) => t.status === "pending").length,
      inProgress: tasks.filter((t) => t.status === "in-progress").length,
      completed: tasks.filter((t) => t.status === "completed").length,
      cancelled: tasks.filter((t) => t.status === "cancelled").length,
      overdue: tasks.filter((t) => {
        if (!t.dueDate || t.status === "completed" || t.status === "cancelled")
          return false;
        return new Date(t.dueDate) < new Date();
      }).length,
      high: tasks.filter(
        (t) =>
          (t.priority === "high" || t.priority === "urgent") &&
          t.status !== "completed"
      ).length,
    };

    return stats;
  },
});
