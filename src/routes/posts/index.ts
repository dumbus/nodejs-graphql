import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import { idParamSchema } from '../../utils/reusedSchemas';
import { createPostBodySchema, changePostBodySchema } from './schema';
import type { PostEntity } from '../../utils/DB/entities/DBPosts';

const plugin: FastifyPluginAsyncJsonSchemaToTs = async (
  fastify
): Promise<void> => {
  fastify.get('/', async function (request, reply): Promise<PostEntity[]> {
    const posts = await fastify.db.posts.findMany();

    return posts;
  });

  fastify.get(
    '/:id',
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<PostEntity> {
      const postId = request.params.id;
      const post = await fastify.db.posts.findOne({ key: 'id', equals: postId });

      if (!post) {
        throw fastify.httpErrors.notFound('Post was not found...');
      }

      return post;
    }
  );

  fastify.post(
    '/',
    {
      schema: {
        body: createPostBodySchema,
      },
    },
    async function (request, reply): Promise<PostEntity> {
      const authorId = request.body.userId;
      const postAuthor = await fastify.db.users.findOne({ key: 'id', equals: authorId });

      if (!postAuthor) {
        throw fastify.httpErrors.badRequest('Author of post was not found...');
      }

      const postDTO = request.body;
      const post = await fastify.db.posts.create(postDTO);

      return post;
    }
  );

  fastify.delete(
    '/:id',
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<PostEntity> {
      const postId = request.params.id;
      const post = await fastify.db.posts.findOne({ key: 'id', equals: postId });

      if (!post) {
        throw fastify.httpErrors.badRequest('Post was not found...');
      }

      const deletedPost = await fastify.db.posts.delete(postId);

      return deletedPost;
    }
  );

  fastify.patch(
    '/:id',
    {
      schema: {
        body: changePostBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<PostEntity> {
      try {
        const postId = request.params.id;
        const postDTO = request.body;

        const patchedPost = await fastify.db.posts.change(postId, postDTO);

        return patchedPost;
      } catch (error: any) {
        throw fastify.httpErrors.badRequest(error);
      }
    }
  );
};

export default plugin;
