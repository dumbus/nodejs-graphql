import { FastifyInstance } from 'fastify';

import { UserEntity } from '../../utils/DB/entities/DBUsers';
import { ProfileEntity } from '../../utils/DB/entities/DBProfiles';
import { PostEntity } from '../../utils/DB/entities/DBPosts';
import { MemberTypeEntity } from '../../utils/DB/entities/DBMemberTypes';

const isUserExists = async (user: UserEntity | null, fastify: FastifyInstance) => {
  if (!user) {
    throw fastify.httpErrors.notFound('User was not found...');
  }
};

const isProfileExists = async (profile: ProfileEntity | null, fastify: FastifyInstance) => {
  if (!profile) {
    throw fastify.httpErrors.notFound('Profile was not found...');
  }
};

const isPostExists = async (post: PostEntity | null, fastify: FastifyInstance) => {
  if (!post) {
    throw fastify.httpErrors.notFound('Post was not found...');
  }
};

const isMemberTypeExists = async (memberType: MemberTypeEntity | null, fastify: FastifyInstance) => {
  if (!memberType) {
    throw fastify.httpErrors.notFound('Member Type was not found...');
  }
};

const isUserHasProfile = async (userId: string, fastify: FastifyInstance) => {
  const profile = await fastify.db.profiles.findOne({ key: 'userId', equals: userId });

  if (profile) {
    throw fastify.httpErrors.badRequest('You have a profile...');
  }
};

const isUserHimself = async (userId: string, subscribeToUserId: string, fastify: FastifyInstance) => {
  if (userId === subscribeToUserId) {
    throw fastify.httpErrors.badRequest('You are trying to subscribe yourself...');
  }
};

const isUserSubscribed = async (userId: string, userToSubscribe: UserEntity | null, fastify: FastifyInstance) => {
  if (!userToSubscribe) {
    throw fastify.httpErrors.notFound('User you are trying to subscribe was not found...');
  }

  if (userToSubscribe.subscribedToUserIds.includes(userId)) {
    throw fastify.httpErrors.badRequest('You are already subscribed...');
  }
};

const isUserUnsubscribed = async (userId: string, userToUnsubscribe: UserEntity | null, fastify: FastifyInstance) => {
  if (!userToUnsubscribe) {
    throw fastify.httpErrors.notFound('User you are trying to unsubscribe was not found...');
  }

  if (!userToUnsubscribe.subscribedToUserIds.includes(userId)) {
    throw fastify.httpErrors.badRequest('You are already subscribed...');
  }
};

export {
  isUserExists,
  isProfileExists,
  isPostExists,
  isMemberTypeExists ,
  isUserHasProfile,
  isUserHimself,
  isUserSubscribed,
  isUserUnsubscribed
};
