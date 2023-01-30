import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import { graphqlBodySchema } from './schema';
import { TUser, TProfile, TPost, TMemberType } from './types/defaultTypes';
import { TCreateUserInput, TCreateProfileInput, TCreatePostInput } from './types/createTypes';
import { TUpdateUserInput, TUpdateProfileInput, TUpdatePostInput, TUpdateMemberTypeInput } from './types/updateTypes';
import {
  isUserExists,
  isProfileExists,
  isPostExists,
  isMemberTypeExists,
  isUserHasProfile,
  isUserHimself,
  isUserSubscribed,
  isUserUnsubscribed
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

              const user = await fastify.db.users.findOne({ key: 'id', equals: userId });
              await isUserExists(user, fastify);

              const memberType = await fastify.db.memberTypes.findOne({ key: 'id', equals: memberTypeId });
              await isMemberTypeExists(memberType, fastify);
        
              await isUserHasProfile(userId, fastify);
        
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

              const user = await fastify.db.users.findOne({ key: 'id', equals: userId });
              await isUserExists(user, fastify);

              const createdPost = await fastify.db.posts.create(inputData);

              return createdPost;
            }
          },

          // Update entities
          updateUser: {
            type: TUser,
            args: {
              id: { type: new GraphQLNonNull(GraphQLID) },
              variables: { type: new GraphQLNonNull(TUpdateUserInput) }
            },
            resolve: async (_, args) => {
              const id = args.id;
              const inputData = { ...args.variables };

              const user = await fastify.db.users.findOne({ key: 'id', equals: id });
              await isUserExists(user, fastify);

              const updatedUser = await fastify.db.users.change(id, inputData);

              return updatedUser;
            }
          },

          updateProfile: {
            type: TProfile,
            args: {
              id: { type: new GraphQLNonNull(GraphQLID) },
              variables: { type: new GraphQLNonNull(TUpdateProfileInput) }
            },
            resolve: async (_, args) => {
              const id = args.id;
              const inputData = { ...args.variables };
              const { memberTypeId } = inputData;

              const profile = await fastify.db.profiles.findOne({ key: 'id', equals: id });
              await isProfileExists(profile, fastify);

              const memberType = await fastify.db.memberTypes.findOne({ key: 'id', equals: memberTypeId });
              await isMemberTypeExists(memberType, fastify);

              const updatedProfile = await fastify.db.profiles.change(id, inputData);

              return updatedProfile;
            }
          },

          updatePost: {
            type: TPost,
            args: {
              id: { type: new GraphQLNonNull(GraphQLID) },
              variables: { type: new GraphQLNonNull(TUpdatePostInput) }
            },
            resolve: async (_, args) => {
              const id = args.id;
              const inputData = { ...args.variables };

              const post = await fastify.db.posts.findOne({ key: 'id', equals: id });
              await isPostExists(post, fastify);

              const updatedPost = await fastify.db.posts.change(id, inputData);

              return updatedPost;
            }
          },

          updateMemberType: {
            type: TMemberType,
            args: {
              id: { type: new GraphQLNonNull(GraphQLID) },
              variables: { type: new GraphQLNonNull(TUpdateMemberTypeInput) }
            },
            resolve: async (_, args) => {
              const id = args.id;
              const inputData = { ...args.variables };

              const memberType = await fastify.db.memberTypes.findOne({ key: 'id', equals: id });
              await isMemberTypeExists(memberType, fastify);

              const updatedMemberType = await fastify.db.posts.change(id, inputData);

              return updatedMemberType;
            }
          },

          subscribeToUser: {
            type: TUser,
            args: {
              id: { type: new GraphQLNonNull(GraphQLID) },
              subscribeToUserId: { type: new GraphQLNonNull(GraphQLID) }
            },
            resolve: async (_, args) => {
              const { id, subscribeToUserId } = args;

              const user = await fastify.db.users.findOne({ key: 'id', equals: id });
              await isUserExists(user, fastify);

              const userToSubscribe = await fastify.db.users.findOne({ key: 'id', equals: subscribeToUserId });
              await isUserHimself(id, subscribeToUserId, fastify);
              await isUserSubscribed(id, userToSubscribe, fastify);

              if (userToSubscribe) {
                const changesDTO = {
                  subscribedToUserIds: [...userToSubscribe.subscribedToUserIds, id]
                };
  
                const subscribedUser = await fastify.db.users.change(subscribeToUserId, changesDTO);
  
                return subscribedUser;
              }
            }
          },

          unsubscribeFromUser: {
            type: TUser,
            args: {
              id: { type: new GraphQLNonNull(GraphQLID) },
              unsubscribeFromUserId: { type: new GraphQLNonNull(GraphQLID) }
            },
            resolve: async (_, args) => {
              const { id, unsubscribeFromUserId } = args;

              const user = await fastify.db.users.findOne({ key: 'id', equals: id });
              await isUserExists(user, fastify);

              const userToUnsubscribe = await fastify.db.users.findOne({ key: 'id', equals: unsubscribeFromUserId });
              await isUserHimself(id, unsubscribeFromUserId, fastify);
              await isUserUnsubscribed(id, userToUnsubscribe, fastify);

              if (userToUnsubscribe) {
                const deletingUserIndex = userToUnsubscribe.subscribedToUserIds.indexOf(id);
                userToUnsubscribe.subscribedToUserIds.splice(deletingUserIndex, 1);
        
                const changesDTO = {
                  subscribedToUserIds: userToUnsubscribe.subscribedToUserIds
                }
        
                const unsubscribedUser = await fastify.db.users.change(unsubscribeFromUserId, changesDTO);
        
                return unsubscribedUser;
              }
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
