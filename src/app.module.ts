import { HttpModule } from '@nestjs/axios';
import { BullModule } from '@nestjs/bull';
import { CacheModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from 'nest-schedule';
import { BlockSync, IPAassets } from './entities';
import { BlockSyncRepository } from './repositories/block-sync.repository';
import { IPAassetsRepository } from './repositories/ipasset.repository';
import { ConfigService, ENV_CONFIG } from './shared/services/config.service';
import { SharedModule } from './shared/shared.module';
import { BedrockAgentModule } from './modules/bedrockAgent/bedrockAgent.module';
import { SyncIPAssetService } from './services/sync-ipasset.service';

const controllers = [];
const entities = [BlockSync, IPAassets];

const repositories = [
  BlockSyncRepository,
  IPAassetsRepository,
];

const services = [SyncIPAssetService];

const processors = [];

@Module({
  imports: [
    ScheduleModule.register(),
    HttpModule.registerAsync({
      useFactory: () => ({
        timeout: 5000,
        maxRedirects: 5,
      }),
    }),
    BullModule.forRoot({
      // redis: {
      //   host: ENV_CONFIG.REDIS.HOST,
      //   port: ENV_CONFIG.REDIS.PORT,
      //   username: ENV_CONFIG.REDIS.USERNAME,
      //   db: parseInt(ENV_CONFIG.REDIS.DB, 10),
      // },
      // prefix: ENV_CONFIG.REDIS.PREFIX,
      defaultJobOptions: {
        removeOnFail: ENV_CONFIG.KEEP_JOB_COUNT,
        removeOnComplete: { count: ENV_CONFIG.KEEP_JOB_COUNT },
      },
    }),
    // BullModule.registerQueue({
    //   name: 'smart-contracts',
    // }),
    CacheModule.register({ ttl: 10000 }),
    SharedModule,
    BedrockAgentModule,
    TypeOrmModule.forFeature([...entities]),
    TypeOrmModule.forRootAsync({
      imports: [SharedModule],
      useFactory: (configService: ConfigService) => configService.typeOrmConfig,
      inject: [ConfigService],
    }),
  ],
  exports: [BullModule, ...processors],
  controllers: [...controllers],
  providers: [...repositories, ...services, ...processors],
})
export class AppModule {}
