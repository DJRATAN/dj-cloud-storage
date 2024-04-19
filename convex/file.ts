import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getUser } from "./users";

export const createFile = mutation({
    args: {
        name: v.string(),
        orgId: v.string(),
    },
    async handler(ctx, args) {
        const identity = await ctx.auth.getUserIdentity();
        // console.log(identity)
        if (!identity) {
            throw new ConvexError("You must be logged in to upload a file!")
        }
        const user = await getUser(ctx, identity.tokenIdentifier)
        // console.log(user)
        const hasAccess = user.orgIds.includes(args.orgId) || user.tokenIdentifier.includes(args.orgId)

        // console.log(identity.tokenIdentifier)
        // console.log(user.tokenIdentifier)
        // console.log(args.orgId)
        console.log(user.orgIds)
        if (!hasAccess) {
            throw new ConvexError("You do not have access to this org!")
        }
        // console.log(hasAccess)
        await ctx.db.insert("files", {
            name: args.name,
            orgId: args.orgId,
        });
    }
})

export const getFiles = query({
    args: {
        orgId: v.string(),
    },
    async handler(ctx, args) {
        const identity = await ctx.auth.getUserIdentity();
        // console.log(identity?.email)
        if (!identity) {
            return []
        }
        return ctx.db.query("files").withIndex('by_orgId', (q) => q.eq('orgId', args.orgId)).collect()
    },
})