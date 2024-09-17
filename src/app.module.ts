import { HttpModule } from '@nestjs/axios';
import { BullModule } from '@nestjs/bull';
import { CacheModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from 'nest-schedule';
import { BlockSync, IPAssets, IPAssetData, LicenseAttach } from './entities';
import { BlockSyncRepository } from './repositories/block-sync.repository';
import { IPAssetsRepository } from './repositories/ipasset.repository';
import { ConfigService, ENV_CONFIG } from './shared/services/config.service';
import { SharedModule } from './shared/shared.module';
import { BedrockAgentModule } from './modules/bedrockAgent/bedrockAgent.module';
import { SyncIPAssetService } from './services/sync-ipasset.service';
import { LicenseTokenRepository } from './repositories/licensetoken.repository';
import { LicenseToken } from './entities/license-token.entity';
import { SyncLicenseService } from './services/sync-license.service';
import { SyncDisputeService } from './services/sync-dispute.service';
import { DisputeRaiseRepository } from './repositories/dispute-raise.repository';
import { DisputeRaise } from './entities/dispute-raise.entity';
import { DisputeCancelled } from './entities/dispute-cancelled.entity';
import { DisputeCancelledRepository } from './repositories/dispute-cancelled.repository';
import { CommonService } from './services/common.service';
import { DerivativeRepository } from './repositories/derivative.repository';
import { SyncDerivativeService } from './services/sync-derivative.service';
import { Derivative } from './entities/derivative.entity';
import { IpassetModule } from './modules/ipasset/ipasset.module';
import { LicenseTermsModule } from './modules/licenseTerms/licenseTerms.module';
import { LicenseModule } from './modules/license/license.module';
import { SpgModule } from './modules/spg/spg.module';
import { SyncIpassetProcessor } from './services/processor/sync-ipasset.processor';
import { SyncIpassetDataProcessor } from './services/processor/sync-ipasset-data.processor';
import { IPAssetDataRepository } from './repositories/ipasset-data.repository';
import { SyncLicenseProcessor } from './services/processor/sync-license.processor';
import { LicenseAttachRepository } from './repositories/license-attach.repository';

const controllers = [];
const entities = [
  BlockSync,
  IPAssets,
  LicenseToken,
  DisputeRaise,
  DisputeCancelled,
  Derivative,
  IPAssetData,
  LicenseAttach,
];

export const repositories = [
  BlockSyncRepository,
  IPAssetsRepository,
  IPAssetDataRepository,
  LicenseTokenRepository,
  DisputeRaiseRepository,
  DisputeCancelledRepository,
  DerivativeRepository,
  LicenseAttachRepository,
];

const services = [CommonService, SyncIPAssetService, SyncLicenseService, SyncDisputeService, SyncDerivativeService];

const processors = [SyncIpassetProcessor, SyncIpassetDataProcessor, SyncLicenseProcessor];

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
    BullModule.registerQueue(
      {
        name: ENV_CONFIG.STORY_PROTOCOL_SYNC.IPASSET_SYNC,
        processors: ['./src/services/processor/sync-ipasset.processor.ts'],
      },
      {
        name: ENV_CONFIG.STORY_PROTOCOL_SYNC.IPASSET_DATA_SYNC,
        processors: ['./src/services/processor/sync-ipasset-data.processor.ts'],
      },
      {
        name: ENV_CONFIG.STORY_PROTOCOL_SYNC.LICENSE_SYNC,
        processors: ['./src/services/processor/sync-license.processor.ts'],
      }
    ),
    CacheModule.register({ ttl: 10000 }),
    SharedModule,
    BedrockAgentModule,
    IpassetModule,
    LicenseTermsModule,
    LicenseModule,
    SpgModule,
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
