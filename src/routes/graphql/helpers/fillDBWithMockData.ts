import { FastifyInstance } from 'fastify';

const fillDBWithMockData = async (fastify: FastifyInstance) => {
  const user0 = await fastify.db.users.create({
    firstName: `firstName 0`,
    lastName: `lastName 0`,
    email: `email 0`
  });

  const user1 = await fastify.db.users.create({
    firstName: `firstName 1`,
    lastName: `lastName 1`,
    email: `email 1`
  });

  const user2 = await fastify.db.users.create({
    firstName: `firstName 2`,
    lastName: `lastName 2`,
    email: `email 2`
  });

  const users = [
    user0,
    user1,
    user2
  ];

  // user1 && user2 are subscribed to user0
  await fastify.db.users.change(user0.id, { subscribedToUserIds: [user1.id, user2.id] });

  for (let i = 0; i < 3; i++) {
    const userId = users[i].id;

    await fastify.db.profiles.create({
      userId,
      memberTypeId: 'basic',
      avatar: `avatar ${i}`,
      sex: `sex ${i}`,
      birthday: i,
      country: `country ${i}`,
      street: `street ${i}`,
      city: `city ${i}`,
    });
  
    await fastify.db.posts.create({
      userId,
      title: `title ${i}`,
      content: `content ${i}`,
    });
  }
};

export { fillDBWithMockData };
