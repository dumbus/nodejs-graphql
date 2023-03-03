import {
  GraphQLString,
  GraphQLInt,
  GraphQLID,
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

const TSubscribeToUserInput = new GraphQLInputObjectType({
  name: 'SubscribeToUserInput',
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLID) },
    subscribeToUserId: { type: new GraphQLNonNull(GraphQLID) }
  })
});

const TUnsubscribeFromUserInput = new GraphQLInputObjectType({
  name: 'UnsubscribeFromUserInput',
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLID) },
    unsubscribeFromUserId: { type: new GraphQLNonNull(GraphQLID) }
  })
});

export {
  TUpdateUserInput,
  TUpdateProfileInput,
  TUpdatePostInput,
  TUpdateMemberTypeInput,
  TSubscribeToUserInput,
  TUnsubscribeFromUserInput
};
