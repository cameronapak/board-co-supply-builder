import type { AstroBkndConfig } from "bknd/adapter/astro";
import type { APIContext } from "astro";
import { em, media, entity, text, libsql, date } from "bknd/data";
import { secureRandomString } from "bknd/utils";
import { syncTypes } from "bknd/plugins";
import { writeFile } from "node:fs/promises";
import {
  LIBSQL_DATABASE_TOKEN,
  LIBSQL_DATABASE_URL,
  S3_API_URL,
  S3_ACCESS_KEY,
  S3_SECRET_ACCESS_KEY
} from "astro:env/server";

const schema = em(
  {
    orders: entity("orders", {
      // "id" is automatically added
      userId: text({
        label: "User ID"
      }), // foreign key to bknd user
      stripeOrderId: text({
        label: "Stripe Order ID"
      }), // Squarespace order ID for tracking
      designConfig: text({
        label: "Design Configuration"
      }), // JSON string for skateboard design configuration
      artwork: media({ virtual: true, fillable: ["update"], }),
      createdAt: date({
        label: "Created At"
      }),
      updatedAt: date({
        label: "Updated At"
      })
    }),

    media: entity("users", {}),
  },
  ({ relation, index }, { orders, media }) => {
    index(orders)
      .on(["userId"]) // Index for user's orders lookup
      .on(["squarespaceOrderId"]) // Index for Squarespace integration
      .on(["status"]) // Index for order status filtering
      .on(["createdAt"]); // Index for chronological ordering

    relation(orders).polyToMany(media, {
      mappedBy: "artwork",
      targetCardinality: 1
    });
  }
);

export default {
  // we can use any libsql config, and if omitted, uses in-memory
  app: (ctx: APIContext) => ({
    ...(import.meta.env.PROD ? {
      connection: libsql({
        url: LIBSQL_DATABASE_URL,
        authToken: LIBSQL_DATABASE_TOKEN
      })
    } : {
      connection: { url: "file:.astro/content.db" }
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
      if (import.meta.env.DEV) {
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
      }
    },
    plugins: [
      // Writes down the schema types on boot and config change,
      // making sure the types are always up to date.
      syncTypes({
        enabled: true,
        write: async (et) => {
          // customize the location and the writer
          await writeFile("src/bknd-types.d.ts", et.toString());
        }
      })
    ]
  }
} as const satisfies AstroBkndConfig<APIContext>;
