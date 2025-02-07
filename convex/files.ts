import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";

export const list = query(async (ctx) => {
  return await ctx.db.query("files").collect();
});

export const generateUploadUrl = mutation(async (ctx) => {
  return await ctx.storage.generateUploadUrl();
});

export const create = mutation({
  args: {
    name: v.string(),
    size: v.number(),
    type: v.string(),
    position: v.object({
      x: v.number(),
      y: v.number(),
    }),
    storageId: v.string(),
  },
  handler: async (ctx, args) => {
    const exists = await ctx.storage.getUrl(args.storageId);
    if (!exists) throw new ConvexError("File not uploaded to storage");
    return await ctx.db.insert("files", args);
  },
});

export const updatePosition = mutation({
  args: {
    id: v.id("files"),
    position: v.object({
      x: v.number(),
      y: v.number(),
    }),
  },
  handler: async (ctx, { id, position }) => {
    return await ctx.db.patch(id, { position });
  },
});

export const remove = mutation({
  args: { id: v.id("files") },
  handler: async (ctx, { id }) => {
    const file = await ctx.db.get(id);
    if (!file) throw new ConvexError("File not found");

    // Delete from storage first
    await ctx.storage.delete(file.storageId);
    // Then remove from database
    await ctx.db.delete(id);
  },
});
