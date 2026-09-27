import { loadEnv, defineConfig } from '@medusajs/framework/utils'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    databaseDriverOptions: {
      connection: {
        ssl: { rejectUnauthorized: false },
      },
    },
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET,
      cookieSecret: process.env.COOKIE_SECRET,
    },
  },
  modules: [
    {
      resolve: "@medusajs/medusa/payment",
      options: {
        providers: [
          {
            resolve: "./src/modules/payphone",
            id: "payphone",
            options: {
              demo: process.env.PAYPHONE_DEMO !== "false",
              storefrontUrl:
                process.env.PAYPHONE_STOREFRONT_URL ||
                process.env.STORE_CORS?.split(",")[0] ||
                "http://localhost:8000",
            },
          },
        ],
      },
    },
  ],
})
