# NodeJS-GraphQL

Simple API made with GraphQL and NodeJS.

[Assignment](https://github.com/AlreadyBored/nodejs-assignments/blob/main/assignments/graphql-service/assignment.md )  
[Scoring](https://github.com/AlreadyBored/nodejs-assignments/blob/main/assignments/graphql-service/score.md)

## How to download and install application:  

### 1. Clone repository:  
```
git clone https://github.com/dumbus/nodejs-graphql.git  
```
### 2. Change active directory:  
```
cd nodejs-graphql  
```
### 3. Install dependencies:  
```
npm install  
```

## How to run application:  

Run the application:  
```
npm run start  
```
Run test scenarios:  
```
npm run test  
```

## How to check the work of application:

> To make checking process easier, there is a small pack of mock data, that is uploaded to database before your first query:  
https://github.com/dumbus/nodejs-graphql/blob/788acb0eaf34aa37f0206b3239f6bd197e85d0e5/src/routes/graphql/index.ts#L30

To check this task you will need the Postman (or similar program)  
- choose POST method for every request  
- the endpoint for each request is **/graphql**  
- paste the body of query to the QUERY section in the Postman, the variables to GRAPHQL VARIABLES section  

## Examples of queries:

### 2.1. Get users, profiles, posts, memberTypes - 4 operations in one query.

body:  
```
query {  
    users { id }  
    profiles { id }  
    posts { id }  
    memberTypes { id }  
}  
```
### 2.2. Get user, profile, post, memberType by id - 4 operations in one query.

body:  
```
query (
    $userId: ID!
    $profileId: ID!
    $postId: ID!
    $memberTypeId: String!
) {
    user (id: $userId) { id }
    profile (id: $profileId) { id }
    post (id: $postId) { id }
    memberType (id: $memberTypeId) { id }
}
```
variables:
```
{
    "variables": {
        "userId": "USER_ID",
        "profileId": "PROFILE_ID",
        "postId": "POST_ID",
        "memberTypeId": "MEMBERTYPE_ID"
    }
}
```
### 2.3. Get users with their posts, profiles, memberTypes.

body:  
```
query {
    users {
        id
        profile { id }
        posts { id }
        memberType { id }
    }
}
```
### 2.4. Get user by id with his posts, profile, memberType.

body:  
```
query ($userId: ID!) {
    user (id: $userId) {
        id
        profile { id }
        posts { id }
        memberType { id }
    }
}
```
variables:
```
{
    "userId": "USER_ID"
}
```
### 2.5. Get users with their userSubscribedTo, profile.

body:  
```
query {
    users {
        id
        userSubscribedTo { id }
        profile { id }
    }
}
```
### 2.6. Get user by id with his subscribedToUser, posts.

body:  
```
query ($userId: ID!) {
    user (id: $userId) {
        id
        subscribedToUser { id }
        posts { id }
    }
}
```
variables:
```
{
    "userId": "USER_ID"
}
```
### 2.7. Get users with their userSubscribedTo, subscribedToUser (additionally for each user in userSubscribedTo, subscribedToUser add their userSubscribedTo, subscribedToUser).

body:  
```
query {
    users {
        id
        subscribedToUser {
            id
            subscribedToUser { id }
            userSubscribedTo { id }
        }
        userSubscribedTo {
            id
            subscribedToUser { id }
            userSubscribedTo { id }
        }
    }
}
```
### 2.8. Create user.

body:  
```
mutation ($variables: CreateUserInput!) {
    createUser ( variables: $variables) {
        id
        firstName
        lastName
        email
    }
}
```
variables:
```
{
    "variables": {
        "firstName": "firstName 1",
        "lastName": "lastName 1",
        "email": "email 1"
    }
}
```
### 2.9. Create profile.

body:  
```
mutation ($variables: CreateProfileInput!) {
    createProfile ( variables: $variables) {
        id
        userId
        memberTypeId
        avatar
        sex
        birthday
        country
        street
        city
    }
}
```
variables:
```
{
    "variables": {
        "userId": "USER_ID",
        "memberTypeId": "MEMBERTYPE_ID",
        "avatar": "avatar",
        "sex": "sex",
        "birthday": 0,
        "country": "country",
        "street": "street",
        "city": "city"
    }
}
```
### 2.10. Create post.

body:  
```
mutation ($variables: CreatePostInput!) {
    createPost ( variables: $variables) {
        id
        userId
        title
        content
    }
}
```
variables:
```
{
    "variables": {
        "userId": "USER_ID",
        "title": "title",
        "content": "content"
    }
}
```
### 2.11. InputObjectType for DTOs.

```
InputObjectTypes for DTO were created in src/routes/graphql/types/createTypes.ts
```
### 2.12. Update user.

body:  
```
mutation (
    $id: ID!
    $variables: UpdateUserInput!
) {
    updateUser (
        id: $id
        variables: $variables
    ) {
        id
        firstName
        lastName
        email
    }
}
```
variables:
```
{
    "id": "USER_ID",
    "variables": {
        "firstName": "new firstName",
        "lastName": "new lastName",
        "email": "new email"
    }
}
```
### 2.13. Update profile.

body:  
```
mutation (
    $id: ID!
    $variables: UpdateProfileInput!
) {
    updateProfile (
        id: $id
        variables: $variables
    ) {
        id
        userId
        memberTypeId
        avatar
        sex
        birthday
        country
        street
        city
    }
}
```
variables:
```
{
    "id": "PROFILE_ID",
    "variables": {
        "memberTypeId": "MEMBERTYPE_ID",
        "avatar": "new avatar",
        "sex": "new sex",
        "birthday": 1,
        "country": "new country",
        "street": "new street",
        "city": "new city"
    }
}
```
### 2.14. Update post.

body:  
```
mutation (
    $id: ID!
    $variables: UpdatePostInput!
) {
    updatePost (
        id: $id
        variables: $variables
    ) {
        id
        userId
        title
        content
    }
}
```
variables:
```
{
    "id": "POST_ID",
    "variables": {
        "title": "new Title",
        "content": "new content"
    }
}
```
### 2.15. Update memberType.

body:  
```
mutation (
    $id: ID!
    $variables: UpdateMemberTypeInput!
) {
    updateMemberType (
        id: $id
        variables: $variables
    ) {
        id
        discount
        monthPostsLimit
    }
}
```
variables:
```
{
    "id": "MEMBERTYPE_ID",
    "variables": {
        "discount": 1,
        "monthPostsLimit": 1
    }
}
```
### 2.16.1 Subscribe to.

body:  
```
mutation ($variables: SubscribeToUserInput!) {
    subscribeToUser (variables: $variables) {
        id
        firstName
        lastName
        email
        subscribedToUserIds
    }
}
```
variables:
```
{
    "variables": {
        "id": "USER_ID",
        "subscribeToUserId": "USER_ID"
    }
}
```
### 2.16.2 Unsubscribe from.

body:  
```
mutation ($variables: UnsubscribeFromUserInput!) {
    unsubscribeFromUser (variables: $variables) {
        id
        subscribedToUserIds
    }
}
```
variables:
```
{
    "variables": {
        "id": "USER_ID",
        "unsubscribeFromUserId": "USER_ID"
    }
}
```
### 2.17. InputObjectType for DTOs.

```
InputObjectTypes for DTO were created in src/routes/graphql/types/updateTypes.ts
```
### 4. Limit the complexity of the graphql queries by their depth with graphql-depth-limit package.
4.1 Link to the line of code where it was used:   https://github.com/dumbus/nodejs-graphql/blob/e561257bb3a55f038424db08fdf6e9d260c92e4a/src/routes/graphql/index.ts#L42  
Depth limit value is **6**.  
4.2 POST query with depth more than 6:  
body:
```
query {
    users {
        id
        subscribedToUser {
            id
            subscribedToUser {
                id
                subscribedToUser {
                    id
                    subscribedToUser {
                        id
                        subscribedToUser {
                            id
                            subscribedToUser { id }
                        }
                    }
                }
            }
        }
    }
}
```