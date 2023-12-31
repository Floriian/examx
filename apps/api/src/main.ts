import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule } from '@nestjs/swagger';
import { swaggerConfig, validationPipeConfig } from 'src/config';
import { ValidationPipe } from '@nestjs/common';
import { writeFileSync } from 'fs';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

  app.enableCors({
    origin: 'http://localhost:5173',
  });

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, document);

  writeFileSync('./swagger-spec.json', JSON.stringify(document));

  app.useGlobalPipes(new ValidationPipe(validationPipeConfig));

  await app.listen(3001);
}
bootstrap();
