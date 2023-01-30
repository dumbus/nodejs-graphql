import { GraphQLSchema, graphql } from 'graphql';

import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import { graphqlBodySchema } from './schema';

import { getRootQuery } from './schema/query';
import { getRootMutation } from './schema/mutation';

import { fillDBWithMockData } from './helpers/fillDBWithMockData';

let isMockDataCreated = false;

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
        await fillDBWithMockData(fastify);
        isMockDataCreated = true;
      }

      const RootQuery = await getRootQuery(fastify);
      const RootMutation = await getRootMutation(fastify);

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
