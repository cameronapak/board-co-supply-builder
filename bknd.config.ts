import type { AstroBkndConfig } from "bknd/adapter/astro";
import type { APIContext } from "astro";
import { em, enumm, entity, number, text, libsql, date } from "bknd/data";
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
      squarespaceOrderId: text(), // Squarespace order ID for tracking
      orderReference: text().required(), // unique order reference
      designConfig: text(), // JSON string for skateboard design configuration
      artworkFileId: text(), // reference to uploaded artwork file in S3
      customerInfo: text(), // JSON string for customer billing/shipping info
      pricing: text(), // JSON string for pricing breakdown details
      status: enumm({
        enum: ["pending", "processing", "completed", "failed"],
        default_value: "pending"
      }).required(), // order status: pending, processing, completed, failed
      createdAt: date(),
      updatedAt: date()
    })

    // relations and indices are defined separately.
    // the first argument are the helper functions, the second the entities.
  },
  ({ relation, index }, { posts, comments, orders }) => {
    relation(comments).manyToOne(posts);
    // Configure order relationships - orders belong to users
    // Note: bknd handles user relationships automatically via userId field

    // Create indexes for efficient querying
    index(posts).on(["title"]).on(["slug"], true);
    index(orders)
      .on(["userId"]) // Index for user's orders lookup
      .on(["squarespaceOrderId"]) // Index for Squarespace integration
      .on(["orderReference"], true) // Unique index for order reference
      .on(["status"]) // Index for order status filtering
      .on(["createdAt"]); // Index for chronological ordering
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
