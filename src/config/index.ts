import * as dotenv from 'dotenv';
import { z } from 'zod';
dotenv.config();

export const isLocal = process.env.NODE_ENV === 'local';

const envSchema = z.object({
  NODE_ENV: z.enum(['production', 'development', 'test', 'local', 'staging']),
  PORT: z.coerce.number().default(3000),

  MAIL_SENDER: z.string(),
  MAIL_APP_PASSWORD: z.string(),
  MAIL_TIME: z.string().default('1h'),

  MYSQL_URL: z.string(),
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
  mailer: {
    sender: envVars.MAIL_SENDER,
    password: envVars.MAIL_APP_PASSWORD,
    time: envVars.MAIL_TIME,
  },
  mysql: {
    url: envVars.MYSQL_URL,
  },
};