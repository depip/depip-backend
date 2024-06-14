import { HttpModule } from '@nestjs/axios';
import { BullModule } from '@nestjs/bull';
import { CacheModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from 'nest-schedule';
import { SmartContractsProcessor } from './processor/smart-contracts.processor';
import { BlockSync, TokenMarkets, SyncStatus, IPAassets } from './entities';
import { BlockSyncRepository } from './repositories/block-sync.repository';
import { IPAassetsRepository } from './repositories/ipasset.repository';
import { ConfigService, ENV_CONFIG } from './shared/services/config.service';
import { SharedModule } from './shared/shared.module';
// import { TokenMarketsRepository } from './repositories/token-markets.repository';
// import { SoulboundTokenRepository } from './repositories/soulbound-token.repository';
import { SoulboundToken } from './entities/soulbound-token.entity';
import { SyncStatusRepository } from './repositories/sync-status.repository';
import { SyncTaskService } from './services/sync-task.service';

const controllers = [];
const entities = [BlockSync, SyncStatus, TokenMarkets, IPAassets];

const repositories = [
  BlockSyncRepository,
  SyncStatusRepository,
  IPAassetsRepository,
];

const services = [SyncTaskService];

const processors = [SmartContractsProcessor];

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
      redis: {
        host: ENV_CONFIG.REDIS.HOST,
        port: ENV_CONFIG.REDIS.PORT,
        username: ENV_CONFIG.REDIS.USERNAME,
        db: parseInt(ENV_CONFIG.REDIS.DB, 10),
      },
      prefix: ENV_CONFIG.REDIS.PREFIX,
      defaultJobOptions: {
        removeOnFail: ENV_CONFIG.KEEP_JOB_COUNT,
        removeOnComplete: { count: ENV_CONFIG.KEEP_JOB_COUNT },
      },
    }),
    BullModule.registerQueue({
      name: 'smart-contracts',
    }),
    CacheModule.register({ ttl: 10000 }),
    SharedModule,
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
