const { createPool } = require("mysql2");
const { readFileSync } = require("fs");
const { parseSqlFile } = require("../helpers/db");
const { generateUsers } = require("../helpers/users");

class SQL {
  constructor() {
    this.pool = createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    }).promise();
    return this;
  }

  end() {
    this.pool.end();
  }

  async reset() {
    try {
      const dropTables = parseSqlFile(readFileSync("db/drop.sql"));
      const schema = parseSqlFile(readFileSync("db/schema.sql"));
      const seed = parseSqlFile(readFileSync("db/seed.sql"));

      await this.pool.query(...dropTables); // Create fresh DB

      await this.pool.query(...schema); // Initialise db schema

      const users = await generateUsers(20);

      // Promise.all() and array.map() together lets us
      // run multiple DB queries in parallel,
      // waiting for the last query to finish before resolving.
      await Promise.all(
        users.map(async (user) => {
          await this.pool.query(...seed, [[user]]); // Add user to DB
        })
      );
    } catch (err) {
      throw new Error(err);
    }
  }

  async getUsersByOffset(offset, limit) {
    try {
      const [results] = await this.pool.query(
        "SELECT * FROM Users ORDER BY created_at DESC LIMIT ?, ?",
        [offset, limit]
      );

      return results;
    } catch (err) {
      throw new Error(err);
    }
  }

  async getCountOfTotalUsers() {
    try {
      const [usersCount] = await this.pool.query(
        "SELECT COUNT(*) AS usersCount FROM Users ORDER BY created_at DESC"
      );

      return usersCount[0].usersCount;
    } catch (err) {
      throw new Error(err);
    }
  }

  async getUsersByCursor(cursor, limit) {
    try {
      const [results] = cursor
        ? await this.pool.query(
            "SELECT * FROM Users WHERE created_at < ? ORDER BY created_at DESC LIMIT ?",
            [cursor, limit]
          )
        : await this.pool.query(
            "SELECT * FROM Users ORDER BY created_at DESC LIMIT ?",
            [limit]
          );

      return results;
    } catch (err) {
      throw new Error(err);
    }
  }
}

module.exports = {
  SQL,
};
