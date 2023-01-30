import { FastifyInstance } from 'fastify';
import { GraphQLObjectType, GraphQLList, GraphQLID, GraphQLString, GraphQLNonNull } from 'graphql';

import { TUser, TProfile, TPost, TMemberType } from '../types/defaultTypes';

import {
  isUserExists,
  isProfileExists,
  isPostExists,
  isMemberTypeExists
} from '../helpers/validators';

const getRootQuery = async (fastify: FastifyInstance) => {
  const RootQuery = new GraphQLObjectType({
    name: 'RootQuery',
    fields: {
      // Get all entities
      users: {
        type: new GraphQLList(TUser),
        resolve: async () => await fastify.db.users.findMany()
      },

      profiles: {
        type: new GraphQLList(TProfile),
        resolve: async () => await fastify.db.profiles.findMany()
      },

      posts: {
        type: new GraphQLList(TPost),
        resolve: async () => await fastify.db.posts.findMany()
      },

      memberTypes: {
        type: new GraphQLList(TMemberType),
        resolve: async () => await fastify.db.memberTypes.findMany()
      },

      // Get a single entity
      user: {
        type: TUser,
        args: {
          id: { type: new GraphQLNonNull(GraphQLID) }
        },
        resolve: async (_, args) => {
          const id = args.id;

          const user = await fastify.db.users.findOne({ key: 'id', equals: id });

          await isUserExists(user, fastify);
    
          return user;
        }
      },

      profile: {
        type: TProfile,
        args: {
          id: { type: new GraphQLNonNull(GraphQLID) }
        },
        resolve: async (_, args) => {
          const id = args.id;

          const profile = await fastify.db.profiles.findOne({ key: 'id', equals: id });
    
          await isProfileExists(profile, fastify);
    
          return profile;
        }
      },

      post: {
        type: TPost,
        args: {
          id: { type: new GraphQLNonNull(GraphQLID) }
        },
        resolve: async (_, args) => {
          const id = args.id;

          const post = await fastify.db.posts.findOne({ key: 'id', equals: id });

          await isPostExists(post, fastify);
    
          return post;
        }
      },

      memberType: {
        type: TMemberType,
        args: {
          id: { type: new GraphQLNonNull(GraphQLString) }
        },
        resolve: async (_, args) => {
          const id = args.id;

          const memberType = await fastify.db.memberTypes.findOne({ key: 'id', equals: id });

          await isMemberTypeExists(memberType, fastify);
    
          return memberType;
        }
      }
    }
  });

  return RootQuery;
};

export { getRootQuery };
