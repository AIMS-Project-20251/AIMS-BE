import * as dotenv from 'dotenv';
import { z } from 'zod';
dotenv.config();

export const isLocal = process.env.NODE_ENV === 'local';

const envSchema = z.object({
  NODE_ENV: z.enum(['production', 'development', 'test', 'local', 'staging']),
  PORT: z.coerce.number().default(8080),

  FE_URL: z.string(),

  MAIL_SENDER: z.string(),
  MAIL_APP_PASSWORD: z.string(),
  MAIL_TIME: z.string().default('1h'),

  DB_PORT: z.coerce.number(),
  DB_HOST: z.string(),
  DB_PASSWORD: z.string(),
  DB_NAME: z.string(),

  PAYPAL_URL: z.string().optional(),
  PAYPAL_CLIENT_ID: z.string().optional(),
  PAYPAL_CLIENT_SECRET: z.string().optional(),

  VIETQR_URL: z.string(),
  VIETQR_CLIENT_ID: z.string(),
  VIETQR_API_KEY: z.string(),
  BANK_ACCOUNT_NO: z.string(),
  BANK_ACCOUNT_NAME: z.string(),
  BANK_BIN: z.string(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  throw new Error(
    `Config validation error: ${parsed.error.issues.map((e) => `${e.path}: ${e.message}`).join(', ')}`,
  );
}

const envVars = parsed.data;

export const env = {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  fe_url: envVars.FE_URL,
  mailer: {
    sender: envVars.MAIL_SENDER,
    password: envVars.MAIL_APP_PASSWORD,
    time: envVars.MAIL_TIME,
  },
  mysql: {
    port: envVars.DB_PORT,
    host: envVars.DB_HOST,
    password: envVars.DB_PASSWORD,
    database: envVars.DB_NAME,
  },
  paypal: {
    url: envVars.PAYPAL_URL,
    clientId: envVars.PAYPAL_CLIENT_ID,
    clientSecret: envVars.PAYPAL_CLIENT_SECRET,
  },
  vietqr: {
    clientId: envVars.VIETQR_CLIENT_ID,
    apiKey: envVars.VIETQR_API_KEY,
    bankAccountNo: envVars.BANK_ACCOUNT_NO,
    bankAccountName: envVars.BANK_ACCOUNT_NAME,
    bankBin: envVars.BANK_BIN,
  },
};
