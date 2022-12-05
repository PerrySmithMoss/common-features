const express = require("express");
const { SQL } = require("./db/database");
const moment = require("moment");

require("dotenv").config();

const main = async () => {
  const DB = new SQL();
  const app = express();

  DB.reset(); // Reset and Initialise DB

  app.get("/users-offset", async (req, res) => {
    const maxLimit = 6;
    const limit = req.query.limit ? +req.query.limit : maxLimit;
    const page = req.query.page ? +req.query.page : 1;

    try {
      const userCount = await DB.getCountOfTotalUsers();
      const totalPages = Math.ceil(userCount / limit);

      if (page > totalPages) {
        res.status(422).json({
          message: `Specified page too large. Please use page between 1 and ${totalPages}`,
        });
      } else if (page < 1) {
        res.status(422).json({
          message: `Specified page must between 1 and ${totalPages}`,
        });
      } else if (limit > maxLimit) {
        res.status(422).json({
          message: `Specified limit too large. Please use limit of ${maxLimit} or lower.`,
        });
      } else {
        const users = await DB.getUsersByOffset(page, limit);

        res.status(200).json({
          totalItems: userCount,
          totalItemsPerPage: limit,
          totalPages,
          firtPageUrl: `${process.env.SERVER_DOMAIN}/users?page=1`,
          lastPageUrl: `${process.env.SERVER_DOMAIN}/users?page=${totalPages}`,
          nextPageUrl:
            page + 1 > totalPages
              ? null
              : `${process.env.SERVER_DOMAIN}/users?page=${page + 1}`,
          previousPageUrl:
            page - 1 < 1
              ? null
              : `${process.env.SERVER_DOMAIN}/users?page=${page - 1}`,
          users,
        });
      }
    } catch (err) {
      res.status(500).json({
        error: `${err}.`,
      });
    }
  });

  app.get("/users-cursor", async (req, res) => {
    const maxLimit = 2;
    const limit = req.query.limit ? +req.query.limit : maxLimit;
    const cursor = req.query.cursor || null;

    try {
      if (limit > maxLimit) {
        res.status(422).json({
          message: `Specified limit too large. Please use limit of ${maxLimit} or lower.`,
        });
      } else if (!cursor) {
        const users = await DB.getUsersByCursor(null, limit + 1);

        const hasMore = users.length === limit + 1;

        let nextCursor = null;
        if (hasMore) {
          const nextCursorRecord = users[limit];

          nextCursor = nextCursorRecord.created_at;

          users.pop();
        }

        res.status(200).json({
          cursor: cursor,
          nextCursor,
          users,
        });
      } else if (moment(cursor, moment.ISO_8601, true).isValid()) {
        const users = await DB.getUsersByCursor(cursor, limit + 1);

        const hasMore = users.length === limit + 1;

        let nextCursor = null;
        if (hasMore) {
          const nextCursorRecord = users[limit];

          nextCursor = nextCursorRecord.created_at;

          users.pop();
        }

        res.status(200).json({
          cursor: cursor,
          nextCursor,
          users,
        });
      } else if (!moment(cursor, moment.ISO_8601, true).isValid()) {
        res.status(422).json({
          message: `Cursor is invalid. Date must be in ISO format (e.g ${new Date().toISOString()})`,
        });
      } 
    } catch (err) {
      res.status(500).json({
        error: `${err}.`,
      });
    }
  });

  app.listen(process.env.SERVER_PORT, () => {
    console.log(`Server has started on PORT ${process.env.SERVER_PORT}`);
  });
};

main().catch((err) => {
  console.log(err);
});
