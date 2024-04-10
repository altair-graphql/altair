import { Prisma } from '@altairgraphql/db';

// where user is the owner of the query collection
export const workspaceWhereOwner = (userId: string): Prisma.WorkspaceWhereInput => {
  return {
    ownerId: userId,
  };
};

// where user has access to the query collection as the owner or team member
export const workspaceWhereOwnerOrMember = (
  userId: string
): Prisma.WorkspaceWhereInput => {
  return {
    OR: [
      {
        // workspaces user owns
        ownerId: userId,
      },
      {
        // workspaces owned by user's team
        team: {
          TeamMemberships: {
            some: {
              userId,
            },
          },
        },
      },
    ],
  };
};

// where user is the owner of the query collection
export const collectionWhereOwner = (
  userId: string
): Prisma.QueryCollectionWhereInput => {
  return {
    workspace: {
      ...workspaceWhereOwner(userId),
    },
  };
};

// where user has access to the query collection as the owner or team member
export const collectionWhereOwnerOrMember = (
  userId: string
): Prisma.QueryCollectionWhereInput => {
  return {
    workspace: {
      ...workspaceWhereOwnerOrMember(userId),
    },
  };
};

export const queryItemWhereOwnerOrMember = (
  userId: string
): Prisma.QueryItemWhereInput => {
  return {
    collection: {
      ...collectionWhereOwnerOrMember(userId),
    },
  };
};

export const queryItemWhereOwner = (userId: string): Prisma.QueryItemWhereInput => {
  return {
    collection: {
      ...collectionWhereOwner(userId),
    },
  };
};
