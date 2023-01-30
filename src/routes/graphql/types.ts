import { UserEntity } from '../../utils/DB/entities/DBUsers';

import { FastifyInstance } from 'fastify';
import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLID,
  GraphQLList,
  GraphQLOutputType
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
    },
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

export { TUser, TProfile, TPost, TMemberType };