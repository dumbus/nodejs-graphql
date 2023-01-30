import { FastifyInstance } from 'fastify';
import { GraphQLObjectType, GraphQLList } from 'graphql';

import { UserEntity } from '../../utils/DB/entities/DBUsers';
import { GraphQLUser, GraphQLProfile, GraphQLPost, GraphQLMemberType } from './types';

const GetGraphQLUserWithDependencies = async(fastify: FastifyInstance) => {
    const GraphQLUserWithDependencies = new GraphQLObjectType({
        name: 'UserWithDependencies',
        fields: () => ({
            user: {
                type: GraphQLUser,
                resolve: async (parent: UserEntity) => {
                    const id = parent.id;

                    const user = await fastify.db.users.findOne({ key: 'id', equals: id });

                    return user;
                }
            },
            
            profile: {
                type: GraphQLProfile,

                resolve: async (parent: UserEntity) => {
                    const userId = parent.id;

                    const profile = await fastify.db.profiles.findOne({ key: 'userId', equals: userId });

                    return profile;
                }
            },

            posts: {
                type: new GraphQLList(GraphQLPost),

                resolve: async (parent: UserEntity) => {
                    const userId = parent.id;

                    const posts = await fastify.db.posts.findMany({ key: 'userId', equals: userId });

                    return posts;
                }
            },

            memberType: {
                type: GraphQLMemberType,

                resolve: async (parent: UserEntity) => {
                    const userId = parent.id;

                    const profile = await fastify.db.profiles.findOne({ key: 'userId', equals: userId });

                    if (!profile) {
                        return null;
                    }

                    const memberTypeId = profile.memberTypeId;

                    const memberType = await fastify.db.memberTypes.findOne({ key: 'id', equals: memberTypeId });

                    return memberType;
                }
            }
        })
    });

    return GraphQLUserWithDependencies;
};

export { GetGraphQLUserWithDependencies };
