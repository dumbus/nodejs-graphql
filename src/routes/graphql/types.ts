import { UserEntity } from '../../utils/DB/entities/DBUsers';

import { FastifyInstance } from 'fastify';
import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLID,
  GraphQLList,
  GraphQLInputObjectType,
  GraphQLOutputType,
  GraphQLNonNull
} from 'graphql';

const TUser: GraphQLOutputType = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    id: { type: GraphQLID },
    firstName: { type: GraphQLString },
    lastName: { type: GraphQLString },
    email: { type: GraphQLString },
    subscribedToUserIds: { type: new GraphQLList(GraphQLID) },

    profile: {
      type: TProfile,

      resolve: async (parent: UserEntity, args: [], fastify: FastifyInstance) => {
        const userId = parent.id;
        const profile = await fastify.db.profiles.findOne({ key: 'userId', equals: userId });

        return profile;
      }
    },

    posts: {
      type: new GraphQLList(TPost),

      resolve: async (parent: UserEntity, args: [], fastify: FastifyInstance) => {
        const userId = parent.id;
        const posts = await fastify.db.posts.findMany({ key: 'userId', equals: userId });

        return posts;
      }
    },

    memberType: {
      type: TMemberType,

      resolve: async (parent: UserEntity, args: [], fastify: FastifyInstance) => {
        const userId = parent.id;
        const profile = await fastify.db.profiles.findOne({ key: 'userId', equals: userId });

        if (!profile) {
          return null;
        }

        const memberTypeId = profile.memberTypeId;
        const memberType = await fastify.db.memberTypes.findOne({ key: 'id', equals: memberTypeId });

        return memberType;
      }
    },

    userSubscribedTo: {
      type: new GraphQLList(TUser),
      resolve: async (parent: UserEntity, args: [], fastify: FastifyInstance) => {
        const userId = parent.id;

        const userSubscribedTo = await fastify.db.users.findMany({ key: 'subscribedToUserIds', inArray: userId });

        return userSubscribedTo;
      }
    },

    subscribedToUser: {
      type: new GraphQLList(TUser),
      resolve: async (parent: UserEntity, args: [], fastify: FastifyInstance) => {
        const subscribedToUserIds = parent.subscribedToUserIds;

        const subscribedToUser: UserEntity[] = [];

        for (let i = 0; i < subscribedToUserIds.length; i++) {
          const currentSubscriberId = subscribedToUserIds[i];

          const currentSubscriber = await fastify.db.users.findOne({ key: 'id', equals: currentSubscriberId });

          if (currentSubscriber) {
            subscribedToUser.push(currentSubscriber);
          }
        }

        return subscribedToUser;
      }
    }
  })
});

const TProfile = new GraphQLObjectType({
  name: 'Profile',
  fields: () => ({
    id: { type: GraphQLID },
    avatar: { type: GraphQLString },
    sex: { type: GraphQLString },
    birthday: { type: GraphQLInt },
    country: { type: GraphQLString },
    street: { type: GraphQLString },
    city: { type: GraphQLString },
    userId: { type: GraphQLID },
    memberTypeId: { type: GraphQLString }
  })
});

const TPost = new GraphQLObjectType({
  name: 'Post',
  fields: () => ({
    id: { type: GraphQLID },
    title: { type: GraphQLString },
    content: { type: GraphQLString },
    userId: { type: GraphQLID }
  })
});

const TMemberType = new GraphQLObjectType({
  name: 'MemberType',
  fields: () => ({
    id: { type: GraphQLID },
    discount: { type: GraphQLInt },
    monthPostsLimit: { type: GraphQLInt }
  })
});

const TCreateUserInput = new GraphQLInputObjectType({
  name: 'CreateUserInput',
  fields: () => ({
    firstName: { type: new GraphQLNonNull(GraphQLString) },
    lastName: { type: new GraphQLNonNull(GraphQLString) },
    email: { type: new GraphQLNonNull(GraphQLString) }
  })
});

const TCreateProfileInput = new GraphQLInputObjectType({
  name: 'CreateProfileInput',
  fields: () => ({
    userId: { type: new GraphQLNonNull(GraphQLID) },
    memberTypeId: { type: new GraphQLNonNull(GraphQLString) },
    avatar: { type: new GraphQLNonNull(GraphQLString) },
    sex: { type: new GraphQLNonNull(GraphQLString) },
    birthday: { type: new GraphQLNonNull(GraphQLInt) },
    country: { type: new GraphQLNonNull(GraphQLString) },
    street: { type: new GraphQLNonNull(GraphQLString) },
    city: { type: new GraphQLNonNull(GraphQLString) }
  })
});

const TCreatePostInput = new GraphQLInputObjectType({
  name: 'CreatePostInput',
  fields: () => ({
    userId: { type: new GraphQLNonNull(GraphQLID) },
    title: { type: new GraphQLNonNull(GraphQLString) },
    content: { type: new GraphQLNonNull(GraphQLString) }
  })
});

const TUpdateUserInput = new GraphQLInputObjectType({
  name: 'UpdateUserInput',
  fields: () => ({
    firstName: { type: GraphQLString },
    lastName: { type: GraphQLString },
    email: { type: GraphQLString }
  })
});

const TUpdateProfileInput = new GraphQLInputObjectType({
  name: 'UpdateProfileInput',
  fields: () => ({
    avatar: { type: GraphQLString },
    sex: { type: GraphQLString },
    birthday: { type: GraphQLInt },
    country: { type: GraphQLString },
    street: { type: GraphQLString },
    city: { type: GraphQLString },
    memberTypeId: { type: GraphQLString }
  })
});

const TUpdatePostInput = new GraphQLInputObjectType({
  name: 'UpdatePostInput',
  fields: () => ({
    title: { type: new GraphQLNonNull(GraphQLString) },
    content: { type: new GraphQLNonNull(GraphQLString) }
  })
});

const TUpdateMemberTypeInput = new GraphQLInputObjectType({
  name: 'UpdateMemberTypeInput',
  fields: () => ({
    discount: { type: GraphQLInt },
    monthPostsLimit: { type: GraphQLInt }
  })
});

export {
  TUser,
  TProfile,
  TPost,
  TMemberType,
  TCreateUserInput,
  TCreateProfileInput,
  TCreatePostInput,
  TUpdateUserInput,
  TUpdateProfileInput,
  TUpdatePostInput,
  TUpdateMemberTypeInput
};