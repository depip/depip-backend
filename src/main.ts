import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { middleware as expressCtx } from 'express-ctx';
import { json, urlencoded } from 'express';
import { AppModule } from './app.module';
import { ConfigService, ENV_CONFIG } from './shared/services/config.service';
import { SharedModule } from './shared/shared.module';
import { ValidationPipe } from '@nestjs/common';
import { ExpressAdapter } from '@bull-board/express';
const { BullAdapter } = require('@bull-board/api/bullAdapter');
const { createBullBoard } = require('@bull-board/api');
const Queue = require('bull');
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
    .setTitle('Depip Backend Swagger')
    .setVersion('0.1')
    .addServer(configService.get('SWAGGER_PATH'))
    .addServer('/')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('documentation', app, document);

  // setup bullboard
  const serverAdapter = new ExpressAdapter();
  serverAdapter.setBasePath('/admin/queues');
  const queues = [
    ENV_CONFIG.STORY_PROTOCOL_SYNC.IPASSET_SYNC,
    ENV_CONFIG.STORY_PROTOCOL_SYNC.IPASSET_DATA_SYNC,
    ENV_CONFIG.STORY_PROTOCOL_SYNC.LICENSE_SYNC,
  ].map((e) => {
    return new BullAdapter(
      new Queue(
        e,
        `redis://${ENV_CONFIG.REDIS.USERNAME}:${ENV_CONFIG.REDIS.PASSWORD}@${ENV_CONFIG.REDIS.HOST}:${ENV_CONFIG.REDIS.PORT}/${ENV_CONFIG.REDIS.DB}`,
        {
          prefix: ENV_CONFIG.REDIS.PREFIX,
        }
      )
    );
  });

  createBullBoard({
    queues: queues,
    serverAdapter,
  });

  app.use('/admin/queues', serverAdapter.getRouter());

  await app.listen(configService.ENV_CONFIG.APP_PORT);
}
bootstrap();
