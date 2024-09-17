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
      MASTERWALLET: process.env.MASTERWALLET,
      APP_PORT: process.env.PORT,
      WEBSOCKET_URL: process.env.WEBSOCKET_URL,
      THREADS: Number(process.env.THREADS),
      SMART_CONTRACT_SERVICE: process.env.SMART_CONTRACT_SERVICE,
      START_HEIGHT: process.env.START_HEIGHT,
      TIMES_SYNC: Number(process.env.TIMES_SYNC) || 3000,
      IPASSET_SYNC: process.env.IPASSET_SYNC || 'IPAsset',
      TIME_SYNC_IPASSET: Number(process.env.TIME_SYNC_IPASSET) || 10000,
      TIME_SYNC_LICENSE: Number(process.env.TIME_SYNC_LICENSE) || 10000,
      TIME_SYNC_LICENSE_ATTACH: Number(process.env.TIME_SYNC_LICENSE_ATTACH) || 10000,
      IPASSET_DATA_SYNC: process.env.IPASSET_DATA_SYNC || 'IPAssetData',
      TOKENLICENSE_SYNC: Number(process.env.LICENSE_SYNC) || 'TokenLicense',
      DISPUTE_SYNC: process.env.DISPUTE_SYNC || 'Dispute',
      TIME_SYNC_DISPUTE: Number(process.env.TIME_SYNC_DISPUTE) || 10000,
      DERIVATIVE_SYNC: process.env.DERIVATIVE_SYNC || 'Derivative',
      TIME_SYNC_DERIVATIVE: Number(process.env.TIME_SYNC_DERIVATIVE) || 10000,
      SYNC_TRANSACTIONS_CLEAN_UP_DAY: Number(process.env.SYNC_TRANSACTIONS_CLEAN_UP_DAY || 8),
      KEY_BASE_URL: process.env.KEY_BASE_URL,
      PRICE_HOST_SYNC: process.env.PRICE_HOST_SYNC || 'COINGECKO',
      PRICE_TIME_SYNC: process.env.PRICE_TIME_SYNC || '0 */3 * * * *',
      REDIS: {
        HOST: process.env.REDIS_HOST,
        PORT: Number(process.env.REDIS_PORT) || 6379,
        PREFIX: process.env.REDIS_PREFIX,
        DB: process.env.REDIS_DB,
        USERNAME:
          !process.env.REDIS_USERNAME || process.env.REDIS_USERNAME === 'default' ? '' : process.env.REDIS_USERNAME,
        PASSWORD: process.env.REDIS_PASSWORD || '',
      },
      NODE: {
        API: process.env.API,
        RPC: process.env.RPC,
        CHAINID: process.env.CHAINID,
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
        DERIVATIVE: process.env.DERIVATIVE_ADDRESS,
        ROYALTY_POLICYLAP: process.env.ROYALTYPOLICYLAP_ADDRESS,
        LICENSE_TEMPLATE: process.env.LICENSE_TEMPLATE_ADDRESS,
        LICENSE_REGISTRY: process.env.LICENSE_REGISTRY_ADDRESS,
        LICENSE_MODULE: process.env.LICENSE_MODULE_ADDRESS,
        SPG: process.env.SPG_ADDRESS,
        NFT: process.env.NFT_ADDRESS,
        ACCESSCONTROLLER_ADDRESS: process.env.ACCESSCONTROLLER_ADDRESS,
      },
      STORY_PROTOCOL_SYNC: {
        IPASSET_SYNC: process.env.IPASSET_SYNC || 'IPAsset',
        IPASSET_DATA_SYNC: process.env.IPASSET_DATA_SYNC || 'IPAssetData',
        LICENSE_SYNC: process.env.LICENSE_SYNC || 'License',
        LICENSE_ATTACH_SYNC: process.env.LICENSE_ATTACH_SYNC || 'LicenseAttach',
        DISPUTE_SYNC: process.env.LICENSE_SYNC || 'Dispute',
        DERIVATIVE_SYNC: process.env.DERIVATIVE_SYNC || 'Derivative',
      },
      PARTICAL_NETWORK: {
        PARTICAL_RPC_URL: process.env.PARTICAL_RPC_URL || 'https://rpc.particle.network/evm-chain?chainId=',
        CHAIN_ID: process.env.CHAIN_ID,
        PROJECT_ID: process.env.PROJECT_ID,
        CLIENT_KEY: process.env.CLIENT_KEY,
        CUSTOMVALIDATIONSESSION: process.env.CUSTOMVALIDATIONSESSION,
      },
      CHAIN_INFO: {
        COIN_DENOM: process.env.COIN_DENOM,
        COIN_MINIMAL_DENOM: process.env.COIN_MINIMAL_DENOM,
        COIN_DECIMALS: Number(process.env.COIN_DECIMALS),
        PRECISION_DIV: Math.pow(10, Number(process.env.COIN_DECIMALS)),
      },
      COINGECKO: {
        API: process.env.COINGECKO_API,
        COIN_ID: process.env.COIN_ID !== '' ? process.env.COIN_ID : 'aura-network,bitcoin',
        MAX_REQUEST: Number(process.env.MAX_REQUEST) || 250,
        COINGEKO_PLATFORM: process.env.PLATFORM || 'ethereum',
      },
      COIN_MARKET_CAP: {
        API: process.env.COIN_MARKET_CAP_API_EP,
        API_KEY: process.env.COIN_MARKET_CAP_API_KEY,
        COIN_ID: process.env.COIN_ID !== '' ? process.env.COIN_ID : 'aura-network,bitcoin',
        MAX_REQUEST: Number(process.env.MAX_REQUEST) || 250,
        COIN_MARKET_CAP_PLATFORM: process.env.PLATFORM || 'ethereum',
      },
      NODE_ENV: process.env.NODE_ENV,
      IPFS_URL: process.env.IPFS_URL || 'https://ipfs.io/',
      SYNC_MISSING_CONTRACT_CODE: process.env.SYNC_MISSING_CONTRACT_CODE === 'true' ? true : false,
      KEEP_JOB_COUNT: Number(process.env.KEEP_JOB_COUNT) || 10,
      HOROSCOPE: {
        API: process.env.HOROSCOPE_API,
        CHAIN_DB: process.env.HOROSCOPE_CHAIN_DB,
        TIMEOUT: Number(process.env.HOROSCOPE_TIMEOUT) || 0,
      },
      PROCESSOR: {
        IPASSET_DATA: {
          CREATEIPASSETDATA: {
            CONCURRENCY: process.env.PROCESSOR_CONCURRENCY_IPASSETDATA_CREATEIPASSETDATA
              ? Number(process.env.PROCESSOR_CONCURRENCY_IPASSETDATA_CREATEIPASSETDATA)
              : 1,
          },
          GETMETADATA: {
            CONCURRENCY: process.env.PROCESSOR_CONCURRENCY_IPASSETDATA_GETMETADATA
              ? Number(process.env.PROCESSOR_CONCURRENCY_IPASSETDATA_GETMETADATA)
              : 1,
          },
        },
      },
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
