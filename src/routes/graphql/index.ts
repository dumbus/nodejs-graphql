import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import { graphqlBodySchema } from './schema';
import {
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
} from './types';

import {
  isUserExists,
  isProfileExists,
  isPostExists,
  isMemberTypeExists 
} from './validators';

import { FastifyInstance } from 'fastify';
import {
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLList,
  GraphQLSchema,
  GraphQLID,
  graphql,
} from 'graphql';

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
      const { query, variables } = request.body;

      // Fill database with mock data
      if (!isMockDataCreated) {
        await fillDatabaseWithMockData(fastify);
        isMockDataCreated = true;
      }

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
              id: { type: GraphQLID }
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
              id: { type: GraphQLID }
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
              id: { type: GraphQLID }
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
              id: { type: GraphQLID }
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

      const RootMutation = new GraphQLObjectType({
        name: 'RootMutation',
        fields: {
          // Create entities
          createUser: {
            type: TUser,
            args: {
              variables: { type: new GraphQLNonNull(TCreateUserInput) }
            },
            resolve: async (_, args) => {
              const inputData = { ...args.variables };

              const createdUser = await fastify.db.users.create(inputData);

              return createdUser;
            }
          },

          createProfile: {
            type: TProfile,
            args: {
              variables: { type: new GraphQLNonNull(TCreateProfileInput) }
            },
            resolve: async (_, args) => {
              const inputData = { ...args.variables };
              const { userId, memberTypeId, } = inputData;

              // TODO: check if user exists

              const memberType = await fastify.db.memberTypes.findOne({ key: 'id', equals: memberTypeId });
        
              if (!memberType) {
                throw fastify.httpErrors.badRequest('Member type was not found...');
              }
        
              const isUserHasProfile = await fastify.db.profiles.findOne({ key: 'userId', equals: userId });
        
              if (isUserHasProfile) {
                throw fastify.httpErrors.badRequest('You have a profile...');
              }
        
              const profile = await fastify.db.profiles.create(inputData);
        
              return profile;
            }
          },

          createPost: {
            type: TPost,
            args: {
              variables: { type: new GraphQLNonNull(TCreatePostInput) }
            },
            resolve: async (_, args) => {
              const inputData = { ...args.variables };
              const { userId } = inputData;

              const postAuthor = await fastify.db.users.findOne({ key: 'id', equals: userId });
        
              if (!postAuthor) {
                throw fastify.httpErrors.badRequest('Author of post was not found...');
              }

              const createdPost = await fastify.db.posts.create(inputData);

              return createdPost;
            }
          }
        }
      });

      const schema = new GraphQLSchema({
        query: RootQuery,
        mutation: RootMutation
      });

      const result = await graphql({
        schema: schema,
        source: query!,
        variableValues: variables
      });

      return result;
    }
  );
};

export default plugin;
