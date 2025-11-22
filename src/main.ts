import { ValidationPipe, Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import compression from 'compression';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config';
import { AppModule } from './modules/app.module';

const setMiddleware = (app: NestExpressApplication) => {
  app.enableCors({
    credentials: true,
    origin: (_, callback) => callback(null, true),
    allowedHeaders: [
      '*',
      'Authorization',
      'Content-Type',
      'X-Requested-With',
      'Wallet-Address',
      'wallet-address',
    ],
  });

  app.use(helmet());

  // app.use(
  //   rateLimit({
  //     windowMs: 60 * 1000,
  //     limit: 100,
  //     message: 'Too many requests from this source, please try again later.',
  //     standardHeaders: 'draft-7',
  //     legacyHeaders: false,

  //     keyGenerator: (req: Request): string => {
  //       const refreshToken = req.cookies?.[REFRESH_COOKIE_NAME];
  //       if (refreshToken) {
  //         return `rt:${refreshToken}`;
  //       } else {
  //         return `ip:${req.ip}`;
  //       }
  //     },
  //   }),
  // );

  app.use(morgan('combined'));

  app.use(compression());

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );
};

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: new Logger('[]'),
  });
  app.useLogger(new Logger('APP'));
  const logger = new Logger('APP');

  app.setGlobalPrefix('api');

  setMiddleware(app);

  if (process.env.NODE_ENV !== 'production') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('AIMS')
      .setDescription('API documentation for AIMS backend')
      .setVersion('1.0')
      .addBearerAuth()
      .build();

    const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('swagger', app, swaggerDocument, {
      explorer: true,
      customSiteTitle: 'AIMS API Docs',
      swaggerOptions: {
        docExpansion: 'none',
        defaultModelsExpandDepth: -1,
        filter: true,
        url: `/api/swagger-json?v=${Date.now()}`,
      },
      jsonDocumentUrl: 'swagger/json',
    });
  }

  await app.listen(env.port, () =>
    logger.warn(`> Listening on port ${env.port}`),
  );
}

try {
  bootstrap();
} catch (err) {
  console.log(err.message);
}