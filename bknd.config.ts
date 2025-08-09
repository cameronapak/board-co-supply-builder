import type { AstroBkndConfig } from "bknd/adapter/astro";
import { registerLocalMediaAdapter } from "bknd/adapter/node";
import type { APIContext } from "astro";
import { em, enumm, media, entity, text, libsql, date } from "bknd/data";
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

const local = registerLocalMediaAdapter();

const schema = em(
  {
    orders: entity("orders", {
      // "id" is automatically added
      userId: text({
        label: "User ID"
      }), // foreign key to bknd user
      size: enumm({
        enum: [{
          value: '8.0 inches',
          label: '8.0 inches',
        }, {
          value: '8.125 inches',
          label: '8.125 inches',
        }, {
          value: '8.25 inches',
          label: '8.25 inches',
        }, {
          value: '8.375 inches',
          label: '8.375 inches',
        }, {
          value: '8.5 inches',
          label: '8.5 inches',
        }, {
          value: '8.75 inches',
          label: '8.75 inches',
        }, {
          value: '9.0 inches',
          label: '9.0 inches',
        }],
        label: "Skateboard Size",
      }),
      type: enumm({
        enum: [{
          value: "popsicle",
          label: "Popsicle",
        }, {
          value: "shovel",
          label: "Shovel"
        }],
        label: "Skateboard Type",
      }),
      stripeOrderId: text({
        label: "Stripe Order ID"
      }), // Squarespace order ID for tracking
      designConfig: text({
        label: "Design Configuration"
      }), // JSON string for skateboard design configuration
      artwork: media({ virtual: true, fillable: ["update"], }),
      status: enumm({
        enum: [{
          value: "pending",
          label: "Pending"
        }, {
          value: "complete",
          label: "Complete"
        }],
        label: "Order Status",
        default_value: "pending"
      }),
      createdAt: date({
        label: "Created At"
      }),
      updatedAt: date({
        label: "Updated At"
      })
    }, {
      primary_format: "uuid",
    }),

    media: entity("media", {}),
  },
  ({ relation, index }, { orders, media }) => {
    index(orders)
      .on(["userId"]) // Index for user's orders lookup
      .on(["stripeOrderId"]) // Index for Stripe integration
      .on(["status"]) // Index for status filtering
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
      adapter: import.meta.env.PROD ? {
        type: "s3",
        config: {
          access_key: S3_ACCESS_KEY,
          secret_access_key: S3_SECRET_ACCESS_KEY,
          url: S3_API_URL
        }
      } : local({
        path: "./public/uploads", // Files will be stored in this directory
      })
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
