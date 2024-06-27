import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { middleware as expressCtx } from 'express-ctx';
import { json, urlencoded } from 'express';
import { AppModule } from './app.module';
import { ConfigService } from './shared/services/config.service';
import { SharedModule } from './shared/shared.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // app.use(expressCtx);
  // app.use(json({ limit: '500mb' }));
  // app.use(urlencoded({ extended: true, limit: '500mb' }));
  // app.useGlobalPipes(
  //   new ValidationPipe({
  //     transform: true,
  //     skipNullProperties: true,
  //     skipMissingProperties: true,
  //   }),
  // );
  // enable cors
  app.enableCors();

  const configService = app.select(SharedModule).get(ConfigService);

  //setup swagger
  const config = new DocumentBuilder()
    .setTitle('Aura Explorer Sync API')
    .setVersion('0.1')
    .addServer('/')
    .addServer(configService.get('SWAGGER_PATH'))
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('documentation', app, document);

  await app.listen(configService.ENV_CONFIG.APP_PORT);
}
bootstrap();
