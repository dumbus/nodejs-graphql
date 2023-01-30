import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import { GraphQLUser, GraphQLProfile, GraphQLPost, GraphQLMemberType } from './types';
import { graphqlBodySchema } from './schema';

import { GraphQLObjectType, GraphQLList, GraphQLSchema, graphql } from 'graphql';

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
      const RootQuery = new GraphQLObjectType({
        name: 'RootQuery',
        fields: {
          users: {
            type: new GraphQLList(GraphQLUser),
            resolve: () => fastify.db.users.findMany()
          },

          profiles: {
            type: new GraphQLList(GraphQLProfile),
            resolve: () => fastify.db.profiles.findMany()
          },

          posts: {
            type: new GraphQLList(GraphQLPost),
            resolve: () => fastify.db.posts.findMany()
          },

          memberTypes: {
            type: new GraphQLList(GraphQLMemberType),
            resolve: () => fastify.db.memberTypes.findMany()
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
