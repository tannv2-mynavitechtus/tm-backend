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
  
  // Enable CORS
  app.enableCors();
  
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // strip out properties not defined in DTOs
  }));

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
