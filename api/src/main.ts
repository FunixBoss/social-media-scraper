import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import * as moment from 'moment-timezone';
moment.tz.setDefault('Asia/Ho_Chi_Minh');

export { moment };
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  process.env.TZ = 'Asia/Ho_Chi_Minh'
  app.enableCors({
    origin: "*", 
    methods: 'GET,POST,PUT,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type,Authorization',
    exposedHeaders: 'Content-Disposition',
  });
  app.setGlobalPrefix('api'); // Set global prefix for the entire application
  const config = new DocumentBuilder()
    .setTitle('Swagger API')
    .setVersion('1.0')
    .addTag('cats')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/swagger', app, document);
  await app.listen(3000);
}
bootstrap();
