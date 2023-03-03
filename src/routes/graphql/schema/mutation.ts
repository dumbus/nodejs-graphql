import { FastifyInstance } from 'fastify';
import { GraphQLObjectType, GraphQLNonNull, GraphQLID } from 'graphql';

import { TUser, TProfile, TPost, TMemberType } from '../types/defaultTypes';
import { TCreateUserInput, TCreateProfileInput, TCreatePostInput } from '../types/createTypes';
import {
  TUpdateUserInput,
  TUpdateProfileInput,
  TUpdatePostInput,
  TUpdateMemberTypeInput,
  TSubscribeToUserInput,
  TUnsubscribeFromUserInput
} from '../types/updateTypes';

import {
  isUserExists,
  isProfileExists,
  isPostExists,
  isMemberTypeExists,
  isUserHasProfile,
  isUserHimself,
  isUserSubscribed,
  isUserUnsubscribed
} from '../helpers/validators';

const getRootMutation = async (fastify: FastifyInstance) => {
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
          variables: { type: new GraphQLNonNull(TSubscribeToUserInput) }
        },
        resolve: async (_, args) => {
          const { id, subscribeToUserId } = args.variables;

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
          variables: { type: new GraphQLNonNull(TUnsubscribeFromUserInput) }
        },
        resolve: async (_, args) => {
          const { id, unsubscribeFromUserId } = args.variables;

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

  return RootMutation;
};

export { getRootMutation };
