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
import { SyncStatusRepository } from '../repositories/sync-status.repository';
import { getLastestBlockNumber, Contract, getPastEventsByContract } from '../web3';
import  IPAssetRegistryABI  from "../web3/ABI/IPAssetRegistry.json"
import { AbiItem } from 'web3-utils'
import { config } from 'process';
import { LicenseTokenABI } from 'src/web3/ABI/LicenseToken';
import { LicenseToken } from 'src/entities/license-token.entity';

@Injectable()
export class SyncTaskService {
  private readonly _logger = new Logger(SyncTaskService.name);
  private rpc;
  private api;
  private threads = 0;
  private schedulesSync: Array<number> = [];

  isCompleteWrite = false;

  constructor(
    private _commonUtil: CommonUtil,
    private blockSyncRepository: BlockSyncRepository,
    private ipaassetsRepository: IPAassetsRepository,
    private statusRepository: SyncStatusRepository,
    private licenseTokenRepository: LicenseTokenRepository,
    @InjectSchedule() private readonly schedule: Schedule,
    @InjectQueue('smart-contracts') private readonly contractQueue: Queue,
  ) {
    this._logger.log(
      '============== Constructor Sync Task Service ==============',
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
    const blocks = [];
    try {
      const [lastBlock, currentBlock] = await Promise.all([
        this.blockSyncRepository.max('lastBlock'),
        getLastestBlockNumber(),
      ]);
      this._logger.log(`currentBlock: ` + currentBlock);
      this._logger.log(`lastBlock.lastBlock: ` + lastBlock.lastBlock);
      var toBlock = Number(currentBlock)
      var fromBlock = Number(currentBlock)  
      
      fromBlock = lastBlock.lastBlock || fromBlock - 100
      toBlock = fromBlock + 100
      // fromBlock = 6120290;
      // toBlock = 6120299;
      if (toBlock > currentBlock) {
          toBlock = Number(currentBlock)
      }      

      if (currentBlock > fromBlock) {
        await this.processBlock(fromBlock, toBlock, "0xd43fE0d865cb5C26b1351d3eAf2E3064BE3276F6");
        this.updateStatus(toBlock, ENV_CONFIG.IPASSET_SYNC);       
        await this.processBlockLicense(fromBlock, toBlock);
        this.updateStatus(toBlock, ENV_CONFIG.TOKENLICENSE_SYNC);   
      }

    } catch (error) {
      this._logger.log(
        `error when generate base blocks:${fromBlock}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Upate current height of block
   * @param newLastBlock
   */
  async updateStatus(newLastBlock, id) {
    const lastBlock = await this.blockSyncRepository.findOne({ contract: id });
    if(!lastBlock){
        const blockSync = new BlockSync();
        blockSync.contract = id;
        blockSync.lastBlock = newLastBlock;
        await this.blockSyncRepository.create(blockSync);
    }else{
      lastBlock.lastBlock = newLastBlock;
      await this.blockSyncRepository.create(lastBlock);
    }
  }

  /**
   * Process block
   * @param newLastBlock
   */
  async processBlock(fromBlock, toBlock, contract) {
    const ipassetContract = Contract(
      contract,
      IPAssetRegistryABI as AbiItem[]
    );
    this._logger.log(`fromBlock: ` + fromBlock);
    this._logger.log(`toBlock: ` + toBlock);
    var newIPassets: any = await ipassetContract.getPastEvents('IPRegistered', {fromBlock:fromBlock, toBlock: toBlock})
    const ipaassets = [];
    await Promise.all(newIPassets.map(newIPasset => new Promise(async (resolve, reject) => {
      try {
        console.log(newIPasset)
        const ipaasset = new IPAassets();
        ipaasset.contract_address = newIPasset.returnValues.tokenContract;
        ipaasset.token_id = newIPasset.returnValues.tokenId;
        ipaasset.chain_id = newIPasset.returnValues.chainId;
        ipaasset.ip_id = newIPasset.returnValues.ipId;
        ipaasset.name = newIPasset.returnValues.name;
        ipaasset.uri = newIPasset.returnValues.uri;
        ipaasset.registration_date = newIPasset.returnValues.registrationDate;
        ipaassets.push(ipaasset);
        resolve(ipaassets)
      }
      catch (ex) {
          console.error(ex)
          reject(null)
      }
    }))) 

    if (ipaassets.length > 0) {
      this._logger.log(`Insert data to database`);
      await this.ipaassetsRepository.insertOnDuplicate(ipaassets, [
        'id',
      ]);
    }    

  }  
  async processBlockLicense(fromBlock, toBlock) {
    const licenseTokenContract = Contract(
      '0x1333c78A821c9a576209B01a16dDCEF881cAb6f2',
      LicenseTokenABI as AbiItem[]
    );
    this._logger.log(`[LICENSE TOKEN] fromBlock: ` + fromBlock);
    this._logger.log(`[LICENSE TOKEN] toBlock: ` + toBlock);
    var newLicenseTokens: any = await licenseTokenContract.getPastEvents('LicenseTokenMinted', {fromBlock:fromBlock, toBlock: toBlock})
    const licenseTokens = [];
    await Promise.all(newLicenseTokens.map(newLicenseToken => new Promise(async (resolve, reject) => {
      try {
        console.log(newLicenseToken)
        const licenseToken = new LicenseToken();
        licenseToken.signature = newLicenseToken.signature;
        licenseToken.minter = newLicenseToken.returnValues.minter;
        licenseToken.receiver = newLicenseToken.returnValues.receiver;
        licenseToken.token_id = newLicenseToken.returnValues.tokenId;
        licenseTokens.push(licenseToken);
        resolve(licenseTokens)
      }
      catch (ex) {
          console.error(ex)
          reject(null)
      }
    }))) 
  
    if (licenseTokens.length > 0) {
      this._logger.log(`Insert LICENSE TOKEN data to database`);
      await this.licenseTokenRepository.insertOnDuplicate(licenseTokens, [
        'id',
      ]);
    }    
  
  }  
}
