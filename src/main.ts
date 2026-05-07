import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, VersioningType } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Set global prefix to 'api' (without versions)
  app.setGlobalPrefix('api');

  // Enable native URI versioning
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  const corsOrigin = process.env.CORS_ORIGIN;
  const corsCredentials = process.env.CORS_CREDENTIALS === 'true';

  app.enableCors(
    corsOrigin
      ? {
          origin: corsOrigin.split(',').map((origin) => origin.trim()),
          credentials: corsCredentials,
        }
      : undefined,
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // strip out properties not defined in DTOs
    }),
  );

  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
