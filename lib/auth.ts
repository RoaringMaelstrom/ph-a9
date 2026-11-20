import { betterAuth } from "better-auth"
import { APIError, createAuthMiddleware } from "better-auth/api"
import { passwordError } from "./password"
import { MongoClient } from "mongodb"
import { mongodbAdapter } from "@better-auth/mongo-adapter"
import { jwt } from "better-auth/plugins"

const client = new MongoClient(process.env.BETTER_AUTH_DB_URL as string)
const db = client.db("SalonBook")

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  trustedOrigins: [
    "http://localhost:3000",
    ...(process.env.BETTER_AUTH_URL ? [process.env.BETTER_AUTH_URL] : []),
  ],

  database: mongodbAdapter(db, { client }),

  user: {
    additionalFields: {
      // `input: false` means sign-up / updateUser can never set these;
      // admin role is assigned directly in the database.
      role: {
        type: "string",
        defaultValue: "customer",
        input: false,
      },
      isBlocked: {
        type: "boolean",
        defaultValue: false,
        input: false,
      },
      // Editable by the user on their profile page.
      phone: {
        type: "string",
        required: false,
        input: true,
      },
    },
  },

  databaseHooks: {
    session: {
      create: {
        // Reject sign-in (email or Google) for blocked users.
        before: async (session, ctx) => {
          const user = await ctx?.context.internalAdapter.findUserById(
            session.userId
          )
          if (user && (user as { isBlocked?: boolean }).isBlocked) {
            throw new APIError("FORBIDDEN", {
              message:
                "Your account has been blocked. Please contact the salon.",
            })
          }
        },
      },
    },
  },

  emailAndPassword: {
    enabled: true,
    minPasswordLength: 6,
  },

  hooks: {
    // Enforce the password rules on the server, not just in the form.
    before: createAuthMiddleware(async (ctx) => {
      if (ctx.path !== "/sign-up/email") return
      const message = passwordError(String(ctx.body?.password ?? ""))
      if (message) throw new APIError("BAD_REQUEST", { message })
    }),
  },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },

  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["google"], // Add your providers
    },
  },

  session: {
    // Short-lived cache of the session (incl. role/isBlocked) in a signed
    // cookie, to save DB reads. Keep it short so role changes and blocks
    // reach client-side checks (navbar) quickly. Server-side authorization
    // bypasses it entirely (lib/session.ts). This is not the session lifetime.
    cookieCache: {
      enabled: true,
      strategy: "jwt",
      maxAge: 60 * 5,
    },
  },

  plugins: [jwt()],
})
