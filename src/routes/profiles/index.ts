import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import { idParamSchema } from '../../utils/reusedSchemas';
import { createProfileBodySchema, changeProfileBodySchema } from './schema';
import type { ProfileEntity } from '../../utils/DB/entities/DBProfiles';

const plugin: FastifyPluginAsyncJsonSchemaToTs = async (
  fastify
): Promise<void> => {
  fastify.get('/', async function (request, reply): Promise<
    ProfileEntity[]
  > {
    const profiles = await fastify.db.profiles.findMany();

    return profiles;
  });

  fastify.get(
    '/:id',
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<ProfileEntity> {
      const profileId = request.params.id;

      const profile = await fastify.db.profiles.findOne({ key: 'id', equals: profileId });

      if (!profile) {
        throw fastify.httpErrors.notFound('Profile was not found...');
      }

      return profile;
    }
  );

  fastify.post(
    '/',
    {
      schema: {
        body: createProfileBodySchema,
      },
    },
    async function (request, reply): Promise<ProfileEntity> {
      const memberTypeId = request.body.memberTypeId;

      const memberType = await fastify.db.memberTypes.findOne({ key: 'id', equals: memberTypeId });

      if (!memberType) {
        throw fastify.httpErrors.badRequest('Member type was not found...');
      }

      const userId = request.body.userId;

      const isUserHasProfile = await fastify.db.profiles.findOne({ key: 'userId', equals: userId });

      if (isUserHasProfile) {
        throw fastify.httpErrors.badRequest('You have a profile...');
      }

      const profileDTO = request.body;

      const profile = await fastify.db.profiles.create(profileDTO);

      return profile;
    }
  );

  fastify.delete(
    '/:id',
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<ProfileEntity> {
      const profileId = request.params.id;
      const profile = await fastify.db.profiles.findOne({ key: 'id', equals: profileId });

      if (!profile) {
        throw fastify.httpErrors.badRequest('Post was not found...');
      }

      const deletedProfile = await fastify.db.profiles.delete(profileId);

      return deletedProfile;
    }
  );

  fastify.patch(
    '/:id',
    {
      schema: {
        body: changeProfileBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<ProfileEntity> {
      const memberTypeId = request.body.memberTypeId;

      if (memberTypeId) {
        const memberType = await fastify.db.memberTypes.findOne({ key: 'id', equals: memberTypeId });

        if (!memberType) {
          throw fastify.httpErrors.badRequest('Member Type was not found...');
        }
      } else {
        throw fastify.httpErrors.badRequest('Member Type was not specified...');
      }

      try {
        const profileId = request.params.id;
        const profileDTO = request.body;

        const patchedProfile = await fastify.db.profiles.change(profileId, profileDTO);

        return patchedProfile;
      } catch (error: any) {
        throw fastify.httpErrors.badRequest(error);
      }
    }
  );
};

export default plugin;
