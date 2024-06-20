import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';
import { DATABASE_TYPE } from '../../common/constants/app.constant';
import { PascalCaseStrategy } from '../pascalCase.strategy';

export class ConfigService {
  constructor() {
    dotenv.config({
      path: `.env`,
    });

    // Replace \\n with \n to support multiline strings in AWS
    for (const envName of Object.keys(process.env)) {
      process.env[envName] = process.env[envName].replace(/\\n/g, '\n');
    }
  }

  get isDevelopment(): boolean {
    return this.nodeEnv === 'development';
  }

  get isProduction(): boolean {
    return this.nodeEnv === 'production';
  }

  public get(key: string): string {
    return process.env[key];
  }

  public getNumber(key: string): number {
    return Number(this.get(key));
  }

  get nodeEnv(): string {
    return this.get('NODE_ENV') || 'development';
  }

  get ENV_CONFIG() {
    return {
      APP_PORT: process.env.PORT,
      WEBSOCKET_URL: process.env.WEBSOCKET_URL,
      THREADS: Number(process.env.THREADS),
      SMART_CONTRACT_SERVICE: process.env.SMART_CONTRACT_SERVICE,
      START_HEIGHT: process.env.START_HEIGHT,
      TIMES_SYNC: Number(process.env.TIMES_SYNC) || 3000,
      IPASSET_SYNC: process.env.IPASSET_SYNC || "IPAsset",
      SYNC_TRANSACTIONS_CLEAN_UP_DAY: Number(
        process.env.SYNC_TRANSACTIONS_CLEAN_UP_DAY || 8,
      ),
      KEY_BASE_URL: process.env.KEY_BASE_URL,
      PRICE_HOST_SYNC: process.env.PRICE_HOST_SYNC || 'COINGECKO',
      PRICE_TIME_SYNC: process.env.PRICE_TIME_SYNC || '0 */3 * * * *',
      REDIS: {
        HOST: process.env.REDIS_HOST,
        PORT: Number(process.env.REDIS_PORT) || 6379,
        PREFIX: process.env.INDEXER_CHAIN_ID,
        DB: process.env.REDIS_DB,
        USERNAME:
          !process.env.REDIS_USERNAME ||
          process.env.REDIS_USERNAME === 'default'
            ? ''
            : process.env.REDIS_USERNAME,
        PASSWORD: process.env.REDIS_PASSWORD || '',
      },
      NODE: {
        API: process.env.API,
        RPC: process.env.RPC,
      },
      BEDROCK: {
        REGION: process.env.REGION,
        ACCESSKEY: process.env.ACCESSKEY,
        SECRET: process.env.SECRET,
        AGENTID: process.env.AGENTID,
        AGENTALIASID: process.env.AGENTALIASID,
      },      
      STORY_PROTOCOL_CONTRACT: {
        IPASSET: process.env.IPASSET_ADDRESS,
        LICENSE: process.env.LICENSE_ADDRESS,
        ROYALTY: process.env.ROYALTY_ADDRESS,
        DISTUPE: process.env.DISTUPE_ADDRESS,
      },    
      STORY_PROTOCOL_SYNC: {
        IPASSET_SYNC: process.env.IPASSET_SYNC || "IPAsset",
        LICENSE_SYNC: process.env.LICENSE_SYNC || "License",
        DERIVATIVE_SYNC: process.env.DERIVATIVE_SYNC || "Derivative",
      },          
      CHAIN_INFO: {
        COIN_DENOM: process.env.COIN_DENOM,
        COIN_MINIMAL_DENOM: process.env.COIN_MINIMAL_DENOM,
        COIN_DECIMALS: Number(process.env.COIN_DECIMALS),
        PRECISION_DIV: Math.pow(10, Number(process.env.COIN_DECIMALS)),
      },
      INFLUX_DB: {
        BUCKET: process.env.INFLUXDB_BUCKET,
        ORGANIZTION: process.env.INFLUXDB_ORG,
        URL: process.env.INFLUXDB_URL,
        TOKEN: process.env.INFLUXDB_TOKEN,
      },
      COINGECKO: {
        API: process.env.COINGECKO_API,
        COIN_ID:
          process.env.COIN_ID !== ''
            ? process.env.COIN_ID
            : 'aura-network,bitcoin',
        MAX_REQUEST: Number(process.env.MAX_REQUEST) || 250,
        COINGEKO_PLATFORM: process.env.PLATFORM || 'ethereum',
      },
      COIN_MARKET_CAP: {
        API: process.env.COIN_MARKET_CAP_API_EP,
        API_KEY: process.env.COIN_MARKET_CAP_API_KEY,
        COIN_ID:
          process.env.COIN_ID !== ''
            ? process.env.COIN_ID
            : 'aura-network,bitcoin',
        MAX_REQUEST: Number(process.env.MAX_REQUEST) || 250,
        COIN_MARKET_CAP_PLATFORM: process.env.PLATFORM || 'ethereum',
      },
      NODE_ENV: process.env.NODE_ENV,
      IPFS_URL: process.env.IPFS_URL || 'https://ipfs.io/',
      SYNC_MISSING_CONTRACT_CODE:
        process.env.SYNC_MISSING_CONTRACT_CODE === 'true' ? true : false,
      INDEXER_V2: {
        URL: process.env.INDEXER_V2_URL,
        GRAPH_QL: `${process.env.INDEXER_V2_URL}v1/graphql`,
        CHAIN_DB: process.env.INDEXER_V2_DB,
        SECRET: process.env.INDEXER_V2_SECRET,
      },
      KEEP_JOB_COUNT: Number(process.env.KEEP_JOB_COUNT) || 10,
    };
  }

  get typeOrmConfig(): TypeOrmModuleOptions {
    const entities = [__dirname + '/../../entities/**/*.entity{.ts,.js}'];
    const migrations = [__dirname + '/../../migrations/*{.ts,.js}'];

    return {
      entities,
      migrations,
      type: DATABASE_TYPE.POSTGRES,
      host: this.get('DB_HOST'),
      port: this.getNumber('DB_PORT'),
      username: this.get('DB_USER'),
      password: this.get('DB_PASS'),
      database: this.get('DB_NAME'),
      migrationsRun: true,
      // connectTimeout: 1000,
      synchronize: true,
      logging: this.get('DB_LOGGING') === 'true',
      // namingStrategy: new PascalCaseStrategy(),
      // multipleStatements: true,
      // migrationsTransactionMode: 'each',
    };
  }
}

export const ENV_CONFIG = new ConfigService().ENV_CONFIG;
