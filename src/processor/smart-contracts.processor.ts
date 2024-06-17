import {
  OnQueueActive,
  OnQueueCompleted,
  OnQueueError,
  OnQueueFailed,
  Process,
  Processor,
} from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import * as util from 'util';
import {
  COINGECKO_API,
  SOULBOUND_TOKEN_STATUS,
  SOULBOUND_PICKED_TOKEN,
  QUEUES,
  COIN_MARKET_CAP_API,
  REDIS_KEY,
} from '../common/constants/app.constant';
import { SyncDataHelpers } from '../helpers/sync-data.helpers';
import { ConfigService, ENV_CONFIG } from '../shared/services/config.service';
import { CommonUtil } from '../utils/common.util';
import { RedisUtil } from '../utils/redis.util';
import { HttpService } from '@nestjs/axios';
import { In } from 'typeorm';
import { InfluxDBClient } from '../utils/influxdb-client';

import { lastValueFrom, timeout, retry } from 'rxjs';

@Processor('smart-contracts')
export class SmartContractsProcessor {
  private readonly logger = new Logger(SmartContractsProcessor.name);
  private indexerChainId;
  private influxDbClient: InfluxDBClient;

  constructor(
    private _commonUtil: CommonUtil,
    // private tokenMarketsRepository: TokenMarketsRepository,
    private redisUtil: RedisUtil,
    private configService: ConfigService,
    private httpService: HttpService,
    // private soulboundTokenRepos: SoulboundTokenRepository,
  ) {
    this.logger.log(
      '============== Constructor Smart Contracts Processor Service ==============',
    );

    this.indexerChainId = this.configService.get('INDEXER_CHAIN_ID');

    // Connect influxdb
    this.connectInfluxdb();
  }

  connectInfluxdb() {
    this.logger.log(
      `============== call connectInfluxdb method ==============`,
    );
    try {
      this.influxDbClient = new InfluxDBClient(
        ENV_CONFIG.INFLUX_DB.BUCKET,
        ENV_CONFIG.INFLUX_DB.ORGANIZTION,
        ENV_CONFIG.INFLUX_DB.URL,
        ENV_CONFIG.INFLUX_DB.TOKEN,
      );
      if (this.influxDbClient) {
        this.influxDbClient.initWriteApi();
      }
    } catch (err) {
      this.logger.log(
        `call connectInfluxdb method has error: ${err.message}`,
        err.stack,
      );
    }
  }

  @OnQueueActive()
  onActive(job: Job) {
    this.logger.log(`Processing job ${job.id} of type ${job.name}...`);
  }

  @OnQueueCompleted()
  async onComplete(job: Job, result: any) {
    this.logger.log(`Completed job ${job.id} of type ${job.name}`);
    this.logger.log(`Result: ${result}`);
  }

  @OnQueueError()
  onError(job: Job, error: Error) {
    this.logger.error(`Job: ${job}`);
    this.logger.error(`Error job ${job.id} of type ${job.name}`);
    this.logger.error(`Error: ${error}`);
  }

  @OnQueueFailed()
  async onFailed(job: Job, error: Error) {
    this.logger.error(`Failed job ${job.id} of type ${job.name}`);
    this.logger.error(`Error: ${error}`);
  }
}
