import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import { GraphQLUser, GraphQLProfile, GraphQLPost, GraphQLMemberType } from './types';
import { graphqlBodySchema } from './schema';

import { GraphQLObjectType, GraphQLList, GraphQLSchema, graphql, GraphQLID } from 'graphql';

let i = 0;

const fillDatabaseWithMockData = async (fastify: any) => {
  const mockUser = await fastify.db.users.create({
    firstName: `firstName ${i}`,
    lastName: `lastName ${i}`,
    email: `email ${i}`
  });

  await fastify.db.profiles.create({
    userId: mockUser.id,
    memberTypeId: 'basic',
    avatar: `avatar ${i}`,
    sex: `sex ${i}`,
    birthday: i,
    country: `country ${i}`,
    street: `street ${i}`,
    city: `city ${i}`,
  });

  await fastify.db.posts.create({
    userId: mockUser.id,
    title: `title ${i}`,
    content: `content ${i}`,
  });
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
      while (i < 3) {
        await fillDatabaseWithMockData(fastify);
        i++;
      }

      const RootQuery = new GraphQLObjectType({
        name: 'RootQuery',
        fields: {
          // Get all entities: 2.1
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
