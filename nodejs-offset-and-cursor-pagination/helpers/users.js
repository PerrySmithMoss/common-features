const { faker } = require("@faker-js/faker");
const { hash } = require("argon2");

async function createRandomUser() {
  const sex = faker.name.sexType();
  const first_name = faker.name.firstName(sex);
  const last_name = faker.name.lastName();
  const email = faker.helpers.unique(faker.internet.email, [
    first_name,
    last_name,
  ]);
  const password = await hash(faker.internet.password(8, true));
  const created_at = faker.date.between(
    "2022-01-01T01:00:00.000Z",
    "2022-12-31T01:00:00.000Z"
  );

  return [first_name, last_name, sex, email, password, created_at];
}

async function generateUsers(numofUsers) {
  let users = [];

  for (let i = 0; i < numofUsers; i++) {
    const user = await createRandomUser();
    users.push(user);
  }

  return users;
}

module.exports = {
  generateUsers,
};
