import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import { idParamSchema } from '../../utils/reusedSchemas';
import {
  createUserBodySchema,
  changeUserBodySchema,
  subscribeBodySchema,
} from './schemas';
import type { UserEntity } from '../../utils/DB/entities/DBUsers';

const plugin: FastifyPluginAsyncJsonSchemaToTs = async (
  fastify
): Promise<void> => {
  fastify.get('/', async function (request, reply): Promise<UserEntity[]> {
    const posts = await fastify.db.users.findMany();

    return posts;
  });

  fastify.get(
    '/:id',
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<UserEntity> {
      const userId = request.params.id;
      const user = await fastify.db.users.findOne({ key: 'id', equals: userId });

      if (!user) {
        throw fastify.httpErrors.notFound('User was not found...');
      }

      return user;
    }
  );

  fastify.post(
    '/',
    {
      schema: {
        body: createUserBodySchema,
      },
    },
    async function (request, reply): Promise<UserEntity> {
      const userDTO = request.body;
      const user = await fastify.db.users.create(userDTO);

      return user;
    }
  );

  fastify.delete(
    '/:id',
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<UserEntity> {
      const userId = request.params.id;
      const user = await fastify.db.users.findOne({ key: 'id', equals: userId });

      if (!user) {
        throw fastify.httpErrors.badRequest('User was not found...');
      }

      // delete profile
      const userProfile = await fastify.db.profiles.findOne({ key: 'userId', equals: userId });

      if (userProfile) {
        const profileId = userProfile.id;
        await fastify.db.profiles.delete(profileId);
      }

      // clear posts
      const userPosts = await fastify.db.posts.findMany({ key: 'userId', equals: userId });

      userPosts.forEach(async (userPost) => {
        const postId = userPost.id;
        await fastify.db.posts.delete(postId);
      });

      // delete followers dependencies
      const userFollowers = await fastify.db.users.findMany({ key: 'subscribedToUserIds', inArray: userId });

      userFollowers.forEach(async (userFollower) => {
        const userFollowerId = userFollower.id;
        const deletingUserIndex = userFollower.subscribedToUserIds.indexOf(userId);

        userFollower.subscribedToUserIds.splice(deletingUserIndex, 1);

        const changesDTO = {
          subscribedToUserIds: userFollower.subscribedToUserIds
        }

        await fastify.db.users.change(userFollowerId, changesDTO);
      });

      // delete user
      const deletedUser = await fastify.db.users.delete(userId);

      return deletedUser;
     }
  );

  fastify.post(
    '/:id/subscribeTo',
    {
      schema: {
        body: subscribeBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<UserEntity> {
      const userId = request.params.id;
      const userFollowerId = request.body.userId;

      if (userId === userFollowerId) {
        throw fastify.httpErrors.badRequest('You are trying to subscribe yourself...');
      }

      const user = await fastify.db.users.findOne({ key: 'id', equals: userId });
      const userFollower = await fastify.db.users.findOne({ key: 'id', equals: userFollowerId });

      if (!user || !userFollower) {
        throw fastify.httpErrors.badRequest('User was not found...');
      }

      const isUserSubscribed = userFollower.subscribedToUserIds.includes(userId);

      if (isUserSubscribed) {
        return userFollower;
      }

      try {
        const changesDTO = {
          subscribedToUserIds: [...userFollower.subscribedToUserIds, userId]
        };

        const subscribedUser = await fastify.db.users.change(userFollowerId, changesDTO);

        return subscribedUser;
      } catch (error: any) {
        throw fastify.httpErrors.badRequest(error);
      }
    }
  );

  fastify.post(
    '/:id/unsubscribeFrom',
    {
      schema: {
        body: subscribeBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<UserEntity> {
      const userId = request.params.id;
      const userFollowerId = request.body.userId;

      if (userId === userFollowerId) {
        throw fastify.httpErrors.badRequest('You are trying to unsubscribe yourself...');
      }

      const user = await fastify.db.users.findOne({ key: 'id', equals: userId });
      const userFollower = await fastify.db.users.findOne({ key: 'id', equals: userFollowerId });

      if (!user || !userFollower) {
        throw fastify.httpErrors.badRequest('User was not found...');
      }

      const isUserSubscribed = userFollower.subscribedToUserIds.includes(userId);

      if (!isUserSubscribed) {
        throw fastify.httpErrors.badRequest('You are not subscribed to this user...');
      }

      try {
        const deletingUserIndex = userFollower.subscribedToUserIds.indexOf(userId);

        userFollower.subscribedToUserIds.splice(deletingUserIndex, 1);

        const changesDTO = {
          subscribedToUserIds: userFollower.subscribedToUserIds
        }

        const unsubscribedUser = await fastify.db.users.change(userFollowerId, changesDTO);

        return unsubscribedUser;
      } catch (error: any) {
        throw fastify.httpErrors.badRequest(error);
      }
    }
  );

  fastify.patch(
    '/:id',
    {
      schema: {
        body: changeUserBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<UserEntity> {
      try {
        const userId = request.params.id;
        const userDTO = request.body;

        const patchedUser = await fastify.db.users.change(userId, userDTO);

        return patchedUser;
      } catch (error: any) {
        throw fastify.httpErrors.badRequest(error);
      }
    }
  );
};

export default plugin;
