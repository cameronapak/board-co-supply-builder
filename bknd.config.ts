import type { AstroBkndConfig } from "bknd/adapter/astro";
import type { APIContext } from "astro";
import { em, enumm, medium, entity, systemEntity, text, libsql, boolean, date } from "bknd";
import { resendEmail } from "bknd";
import { randomBytes } from "node:crypto";
import { type CodeMode, code } from "bknd/modes";
import { writer } from "bknd/adapter/node";

const schema = em(
  {
    orders: entity("orders", {
      // "id" is automatically added
      email: text({
        label: "User Email"
      }),
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
      stripeTransactionUrl: text({
        label: "Stripe Transaction URL",
        description: "Link to view transaction details on Stripe dashboard",
        hidden: ["create", "form"]
      }), // Link to view transaction on Stripe dashboard
      designConfig: text({
        label: "Design Configuration"
      }), // JSON string for skateboard design configuration
      artwork: medium(),
      canvas: medium(),
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
      emailSent: boolean({
        label: "Email Sent",
        description: "Whether the email has been sent to the owner of the shop",
        default_value: false,
      }),
      comments: text({
        label: "Comments"
      }),
      createdAt: date({
        label: "Created At"
      }),
      updatedAt: date({
        label: "Updated At"
      })
    }, {
      /**
       *  @TODO - Figure out why I was having an issue uploading
       * http://localhost:4321/api/media/entity/orders/01989028-c3f5-738b-a70f-613ee0541e2e/artwork?
       * It'd throw an error saying:
       * "Upload failed with code 404: Entity "orders" with ID "1989028" doesn't exist found"
       **/
      // primary_format: "uuid",
    }),

    media: systemEntity("media", {}),
  },
  ({ relation, index }, { orders, media }) => {
    index(orders)
      .on(["status"]) // Index for status filtering
      .on(["createdAt"]); // Index for chronological ordering

    relation(orders).polyToOne(media, {
      mappedBy: "artwork"
    });

    relation(orders).polyToOne(media, {
      mappedBy: "canvas"
    });
  }
);

/** @see https://docs.bknd.io/usage/introduction/#code-only-mode */
const config = {
  // we can use any libsql config, and if omitted, uses in-memory
  app: (ctx: APIContext) => ({
    connection: libsql({
      url: process.env.LIBSQL_DATABASE_URL || "",
      authToken: process.env.LIBSQL_DATABASE_TOKEN || ""
    })
  }),
  // an initial config is only applied if the database is empty
  config: {
    data: schema.toJSON(),
    // You must set this up in the Admin UI `/admin`
    media: {
      enabled: true,
      adapter: {
        type: "s3",
        config: {
          access_key: process.env.S3_ACCESS_KEY || "",
          secret_access_key: process.env.S3_SECRET_ACCESS_KEY || "",
          url: process.env.S3_API_URL || ""
        }
      }
    },
    // we're enabling auth ...
    auth: {
      allow_register: true,
      enabled: true,
      jwt: {
        issuer: "bknd-astro-example",
        secret: randomBytes(64).toString("hex")
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
      if (process.env.NODE_ENV === "development") {
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
    drivers: {
      email: resendEmail({ apiKey: process.env.RESEND_API_KEY || "" }),
    },
    mode: "code",
  },
  writer,
  typesFilePath: "src/bknd-types.d.ts",
  isProduction: process.env?.PROD === "true",
  syncSchema: {
    force: true,
    drop: true,
  },
} satisfies CodeMode<AstroBkndConfig<APIContext>>;

export default code(config);
