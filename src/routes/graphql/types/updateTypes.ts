import {
  GraphQLString,
  GraphQLInt,
  GraphQLInputObjectType,
  GraphQLNonNull
} from 'graphql';

const TUpdateUserInput = new GraphQLInputObjectType({
  name: 'UpdateUserInput',
  fields: () => ({
    firstName: { type: GraphQLString },
    lastName: { type: GraphQLString },
    email: { type: GraphQLString }
  })
});

const TUpdateProfileInput = new GraphQLInputObjectType({
  name: 'UpdateProfileInput',
  fields: () => ({
    avatar: { type: GraphQLString },
    sex: { type: GraphQLString },
    birthday: { type: GraphQLInt },
    country: { type: GraphQLString },
    street: { type: GraphQLString },
    city: { type: GraphQLString },
    memberTypeId: { type: GraphQLString }
  })
});

const TUpdatePostInput = new GraphQLInputObjectType({
  name: 'UpdatePostInput',
  fields: () => ({
    title: { type: new GraphQLNonNull(GraphQLString) },
    content: { type: new GraphQLNonNull(GraphQLString) }
  })
});

const TUpdateMemberTypeInput = new GraphQLInputObjectType({
  name: 'UpdateMemberTypeInput',
  fields: () => ({
    discount: { type: GraphQLInt },
    monthPostsLimit: { type: GraphQLInt }
  })
});

export { TUpdateUserInput, TUpdateProfileInput, TUpdatePostInput, TUpdateMemberTypeInput };
