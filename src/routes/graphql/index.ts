import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import { GraphQLUser, GraphQLProfile, GraphQLPost, GraphQLMemberType } from './types';
import {
  GetGraphQLUserWithDependencies,
  GetGraphQLUserSubscribedToProfile,
  GetGraphQLSubscribedToUserPosts
} from './helpers';
import { graphqlBodySchema } from './schema';

import { FastifyInstance } from 'fastify';
import { GraphQLObjectType, GraphQLList, GraphQLSchema, graphql, GraphQLID } from 'graphql';

let isMockDataCreated = false;

const fillDatabaseWithMockData = async (fastify: FastifyInstance) => {
  const user0 = await fastify.db.users.create({
    firstName: `firstName 0`,
    lastName: `lastName 0`,
    email: `email 0`
  });

  const user1 = await fastify.db.users.create({
    firstName: `firstName 1`,
    lastName: `lastName 1`,
    email: `email 1`
  });

  const user2 = await fastify.db.users.create({
    firstName: `firstName 2`,
    lastName: `lastName 2`,
    email: `email 2`
  });

  const users = [
    user0,
    user1,
    user2
  ];

  // user1 && user2 are subscribed to user0
  await fastify.db.users.change(user0.id, { subscribedToUserIds: [user1.id, user2.id] });

  for (let i = 0; i < 3; i++) {
    const userId = users[i].id;

    await fastify.db.profiles.create({
      userId,
      memberTypeId: 'basic',
      avatar: `avatar ${i}`,
      sex: `sex ${i}`,
      birthday: i,
      country: `country ${i}`,
      street: `street ${i}`,
      city: `city ${i}`,
    });
  
    await fastify.db.posts.create({
      userId,
      title: `title ${i}`,
      content: `content ${i}`,
    });
  }
};

const plugin: FastifyPluginAsyncJsonSchemaToTs = async (
  fastify
): Promise<void> => {
  fastify.post(
    '/',
    {
      schema: {
        body: graphqlBodySchema,
      },
    },
    async function (request, reply) {
      // Fill database with mock data
      if (!isMockDataCreated) {
        await fillDatabaseWithMockData(fastify);
        isMockDataCreated = true;
      }

      const GraphQLUserWithDependencies = await GetGraphQLUserWithDependencies(fastify);
      const GraphQLUserSubscribedToProfile = await GetGraphQLUserSubscribedToProfile(fastify);
      const GraphQLSubscribedToUserPosts = await GetGraphQLSubscribedToUserPosts(fastify);

      const RootQuery = new GraphQLObjectType({
        name: 'RootQuery',
        fields: {
          // Get all entities: 2.1
          users: {
            type: new GraphQLList(GraphQLUser),
            resolve: async () => await fastify.db.users.findMany()
          },

          profiles: {
            type: new GraphQLList(GraphQLProfile),
            resolve: async () => await fastify.db.profiles.findMany()
          },

          posts: {
            type: new GraphQLList(GraphQLPost),
            resolve: async () => await fastify.db.posts.findMany()
          },

          memberTypes: {
            type: new GraphQLList(GraphQLMemberType),
            resolve: async () => await fastify.db.memberTypes.findMany()
          },

          // Get a single entity: 2.2
          user: {
            type: GraphQLUser,
            args: {
              id: { type: GraphQLID }
            },
            resolve: async (parent, args) => {
              const id = args.id;

              const user = await fastify.db.users.findOne({ key: 'id', equals: id });
        
              if (!user) {
                throw fastify.httpErrors.notFound('User was not found...');
              }
        
              return user;
            }
          },

          profile: {
            type: GraphQLProfile,
            args: {
              id: { type: GraphQLID }
            },
            resolve: async (parent, args) => {
              const id = args.id;

              const profile = await fastify.db.profiles.findOne({ key: 'id', equals: id });
        
              if (!profile) {
                throw fastify.httpErrors.notFound('Profile was not found...');
              }
        
              return profile;
            }
          },

          post: {
            type: GraphQLPost,
            args: {
              id: { type: GraphQLID }
            },
            resolve: async (parent, args) => {
              const id = args.id;

              const post = await fastify.db.posts.findOne({ key: 'id', equals: id });

              if (!post) {
                throw fastify.httpErrors.notFound('Post was not found...');
              }
        
              return post;
            }
          },

          memberType: {
            type: GraphQLMemberType,
            args: {
              id: { type: GraphQLID }
            },
            resolve: async (parent, args) => {
              const id = args.id;

              const memberType = await fastify.db.memberTypes.findOne({ key: 'id', equals: id });

              if (!memberType) {
                throw fastify.httpErrors.notFound('Member Type was not found...');
              }
        
              return memberType;
            }
          },

          // Get users with dependencies: 2.3
          usersWithDependencies: {
            type: new GraphQLList(GraphQLUserWithDependencies),
            resolve: async () => await fastify.db.users.findMany()
          },

          // Get a single user with dependencies: 2.4
          userWithDependencies: {
            type: GraphQLUserWithDependencies,
            args: {
              id: { type: GraphQLID }
            },
            resolve: async (parent, args) => {
              const id = args.id;

              const user = await fastify.db.users.findOne({ key: 'id', equals: id });
        
              if (!user) {
                throw fastify.httpErrors.notFound('User was not found...');
              }
        
              return user;
            }
          },

          // Get users with their userSubscribedTo, profile: 2.5
          usersSubscribedToProfile: {
            type: new GraphQLList(GraphQLUserSubscribedToProfile),
            resolve: async () => await fastify.db.users.findMany()
          },

          // Get user with his subscribedToUser, posts: 2.6
          subscribedToUserPosts: {
            type: GraphQLSubscribedToUserPosts,
            args: {
              id: { type: GraphQLID }
            },
            resolve: async (parent, args) => {
              const id = args.id;

              const user = await fastify.db.users.findOne({ key: 'id', equals: id });
        
              if (!user) {
                throw fastify.httpErrors.notFound('User was not found...');
              }
        
              return user;
            }
          }
        }
      });

      const schema = new GraphQLSchema({
        query: RootQuery
      });

      const result = await graphql({ schema: schema, source: request.body.query! });

      return result;
    }
  );
};

export default plugin;
