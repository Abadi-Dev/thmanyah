import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  // we use this exception  for consistent format
  app.useGlobalFilters(new HttpExceptionFilter());

  // 1. Create the configuration
  const config = new DocumentBuilder()
    .setTitle('Thmanyah Content Discovery API')
    .setDescription('The API for managing and discovering programs/podcasts')
    .setVersion('1.0')
    .addTag('cms', 'Internal management endpoints (not authenticated ATM)')
    .addTag('discovery', 'public search and filter endpoints')
    .build();

  // 2. Create the document
  const document = SwaggerModule.createDocument(app, config);

  // 3. Setup the UI endpoint (e.g., http://localhost:3000/docs)
  SwaggerModule.setup('docs', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
