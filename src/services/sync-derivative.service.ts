import { Injectable, Logger } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { sha256 } from 'js-sha256';
import { InjectSchedule, Schedule } from 'nest-schedule';
import {
  CONST_MSG_TYPE,
  NODE_API,
  QUEUES,
} from '../common/constants/app.constant';
import { BlockSync, IPAassets } from '../entities';
import { SyncDataHelpers } from '../helpers/sync-data.helpers';
import { BlockSyncRepository } from '../repositories/block-sync.repository';
import { IPAassetsRepository } from '../repositories/ipasset.repository';
import { LicenseTokenRepository } from '../repositories/licensetoken.repository';
import { ENV_CONFIG } from '../shared/services/config.service';
import { CommonUtil } from '../utils/common.util';
import { InjectQueue } from '@nestjs/bull';
import { BackoffOptions, JobOptions, Queue } from 'bull';
import { getLastestBlockNumber, Contract, getPastEventsByContract } from '../web3';
import  IPAssetRegistryABI  from "../web3/ABI/IPAssetRegistry.json"
import { AbiItem } from 'web3-utils'
import { config } from 'process';
import { LicenseTokenABI } from 'src/web3/ABI/LicenseToken';
import { LicenseToken } from 'src/entities/license-token.entity';
import { DerivativeRepository } from 'src/repositories/derivative.repository';
import { CommonService } from './common.service';
import { Derivative } from 'src/entities/derivative.entity';
import { DerivativeABI } from 'src/web3/ABI/Derivative';

@Injectable()
export class SyncDerivativeService {
  private readonly _logger = new Logger(SyncDerivativeService.name);
  private rpc;
  private api;
  private threads = 0;
  private schedulesSync: Array<number> = [];

  isCompleteWrite = false;

  constructor(
    private derivativeRepository: DerivativeRepository,
    private commonService: CommonService
  ) {
    this._logger.log(
      '============== Constructor Derivative Sync Task Service ==============',
    );

    this.rpc = ENV_CONFIG.NODE.RPC;
    this.api = ENV_CONFIG.NODE.API;

    this.threads = ENV_CONFIG.THREADS;
  }

  /**
   * Get latest block to insert Block Sync table
   */
  @Interval(ENV_CONFIG.TIMES_SYNC)
  async cronSync() {
    // Get the highest block and insert into SyncBlock
    try {
      const { fromBlock, toBlock, isExcute } = await this.commonService.getBlocks(ENV_CONFIG.TOKENLICENSE_SYNC)
      var fBlock = fromBlock;
      if (isExcute) {
        await this.processBlock(fromBlock, toBlock);
        this.commonService.updateStatus(toBlock, ENV_CONFIG.DERIVATIVE_SYNC);       
      }

    } catch (error) {
      this._logger.log(
        `error when generate base blocks:${fBlock}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Process block
   * @param newLastBlock
   */
  async processBlock(fromBlock, toBlock) {
    const derivativeContract = Contract(
      ENV_CONFIG.STORY_PROTOCOL_CONTRACT.DERIVATIVE,
      DerivativeABI as AbiItem[]
    );
    this._logger.log(`[DERIVATIVE] fromBlock: ` + fromBlock);
    this._logger.log(`[DERIVATIVE] toBlock: ` + toBlock);
    var newDerivatives: any = await derivativeContract.getPastEvents('DerivativeRegistered', {fromBlock:fromBlock, toBlock: toBlock})
    const derivatives = [];
    await Promise.all(newDerivatives.map(newDerivative => new Promise(async (resolve, reject) => {
      try {
        // console.log(newDerivative)
        const derivative = new Derivative();
        derivative.caller = newDerivative?.returnValues?.caller;
        derivative.childIpId = newDerivative?.returnValues?.childIpId;
        derivative.licenseTokenIds = newDerivative?.returnValues?.licenseTokenIds;
        derivative.parentIpIds = newDerivative?.returnValues?.parentIpIds;
        derivative.licenseTermsIds = newDerivative?.returnValues?.licenseTermsIds;
        derivative.licenseTemplate = newDerivative?.returnValues?.licenseTemplate;
        derivative.signature = newDerivative?.signature;
        derivatives.push(derivative);
        resolve(derivatives)
      }
      catch (ex) {
          console.error(ex)
          reject(null)
      }
    }))) 

    if (derivatives.length > 0) {
      this._logger.log(`Insert Derivative data to database`);
      await this.derivativeRepository.upsert(derivatives, [
        'id',
      ]);
    }    

  } 
  
}
