import { ConvexError, v } from "convex/values";
import { MutationCtx, QueryCtx, mutation, query } from "./_generated/server";
import { getUser } from "./users";

export const generateUploadUrl = mutation(async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    // console.log(identity)
    if (!identity) {
        throw new ConvexError("You must be logged in to upload a file!")
    }
    return await ctx.storage.generateUploadUrl();
});

async function hasAccessToOrg(ctx: QueryCtx | MutationCtx, tokenIdentifier: string, orgId: string) {
    const user = await getUser(ctx, tokenIdentifier);
    const hasAccess = user.orgIds.includes(orgId) === user.tokenIdentifier.includes(orgId);
    // console.log(identity.tokenIdentifier)
    // console.log(user.tokenIdentifier)
    // console.log(args.orgId)
    // console.log(user.orgIds)
    return hasAccess;
}
export const createFile = mutation({
    args: {
        name: v.string(),
        fileId: v.id("_storage"),
        orgId: v.string(),
    },
    async handler(ctx, args) {
        // throw new Error("something wrong")
        const identity = await ctx.auth.getUserIdentity();
        // console.log(identity)
        if (!identity) {
            throw new ConvexError("You must be logged in to upload a file!")
        }

        const hasAccess = hasAccessToOrg(ctx, identity.tokenIdentifier, args.orgId)
        if (!hasAccess) {
            throw new ConvexError("You do not have access to this org!")
        }
        // console.log(hasAccess)
        await ctx.db.insert("files", {
            name: args.name,
            fileId: args.fileId,
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
        const hasAccess = hasAccessToOrg(ctx, identity.tokenIdentifier, args.orgId)
        if (!hasAccess) {
            return []
        }
        return ctx.db.query("files").withIndex('by_orgId', (q) => q.eq('orgId', args.orgId)).collect()
    },
})