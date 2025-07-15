import type { AstroBkndConfig } from "bknd/adapter/astro";
import type { APIContext } from "astro";
import { em, entity, number, text, libsql } from "bknd/data";
import { secureRandomString } from "bknd/utils";
import { syncTypes } from "bknd/plugins";
import {
  LIBSQL_DATABASE_TOKEN,
  LIBSQL_DATABASE_URL,
  S3_API_URL,
  S3_ACCESS_KEY,
  S3_SECRET_ACCESS_KEY
} from "astro:env/server";

const schema = em(
  {
    posts: entity("posts", {
      // "id" is automatically added
      title: text().required(),
      slug: text().required(),
      content: text(),
      views: number()
    }),
    comments: entity("comments", {
      content: text()
    }),
    orders: entity("orders", {
      // "id" is automatically added
      userId: text(), // foreign key to bknd user
      squarespaceOrderId: text(),
      orderReference: text().required(),
      designConfig: text(), // JSON string for design configuration
      artworkFileId: text(), // reference to uploaded file
      customerInfo: text(), // JSON string for customer information
      pricing: text(), // JSON string for pricing details
      status: text().required(), // order status
      createdAt: text(),
      updatedAt: text()
    })

    // relations and indices are defined separately.
    // the first argument are the helper functions, the second the entities.
  },
  ({ relation, index }, { posts, comments, orders }) => {
    relation(comments).manyToOne(posts);
    // relation as well as index can be chained!
    index(posts).on(["title"]).on(["slug"], true);
    index(orders).on(["userId"]).on(["squarespaceOrderId"]).on(["orderReference"], true);
  }
);

export default {
  // we can use any libsql config, and if omitted, uses in-memory
  app: (ctx: APIContext) => ({
    connection: libsql({
      url: LIBSQL_DATABASE_URL ?? "file:.astro/content.db",
      authToken: LIBSQL_DATABASE_TOKEN
    })
  }),
  // an initial config is only applied if the database is empty
  initialConfig: {
    data: schema.toJSON(),
    // You must set this up in the Admin UI `/admin`
    media: {
      enabled: true,
      adapter: {
        type: "s3",
        config: {
          access_key: S3_ACCESS_KEY,
          secret_access_key: S3_SECRET_ACCESS_KEY,
          url: S3_API_URL
        }
      }
    },
    // we're enabling auth ...
    auth: {
      allow_register: true,
      enabled: true,
      jwt: {
        issuer: "bknd-astro-example",
        secret: secureRandomString(64)
      },
      guard: {
        enabled: true
      },
      roles: {
        admin: {
          implicit_allow: true
        },
        default: {
          permissions: [
            "system.access.api",
            "data.database.sync",
            "data.entity.create",
            "data.entity.delete",
            "data.entity.update",
            "data.entity.read",
            "media.file.delete",
            "media.file.read",
            "media.file.list",
            "media.file.upload"
          ],
          is_default: true
        }
      }
    }
  },
  options: {
    // the seed option is only executed if the database was empty
    seed: async (ctx) => {
      // create an admin user
      await ctx.app.module.auth.createUser({
        email: "admin@example.com",
        password: "password",
        role: "admin"
      });

      // create a user
      await ctx.app.module.auth.createUser({
        email: "user@example.com",
        password: "password",
        role: "default"
      });

      // create some entries
      await ctx.em.mutator("posts").insertMany([
        { title: "First post", slug: "first-post", content: "..." },
        { title: "Second post", slug: "second-post" }
      ]);
    },
    plugins: [
      // Writes down the schema types on boot and config change,
      // making sure the types are always up to date.
      syncTypes({
        enabled: true,
        write: async (et) => {
          // customize the location and the writer
          await import("fs/promises").then((fs) => fs.writeFile("src/bknd-types.d.ts", et.toString()));
        }
      })
    ]
  }
} as const satisfies AstroBkndConfig<APIContext>;
