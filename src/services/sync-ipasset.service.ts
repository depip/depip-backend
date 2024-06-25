import { Injectable, Logger } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { IPAassets } from '../entities';
import { IPAassetsRepository } from '../repositories/ipasset.repository';
import { ENV_CONFIG } from '../shared/services/config.service';
import { Contract } from '../web3';
import  IPAssetRegistryABI  from "../web3/ABI/IPAssetRegistry.json"
import { AbiItem } from 'web3-utils'
import { CommonService } from './common.service';

@Injectable()
export class SyncIPAssetService {
  private readonly _logger = new Logger(SyncIPAssetService.name);
  private rpc;
  private api;
  private threads = 0;
  private schedulesSync: Array<number> = [];

  isCompleteWrite = false;

  constructor(
    private ipaassetsRepository: IPAassetsRepository,
    private commonService: CommonService
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
    try {
      const { fromBlock, toBlock, isExcute } = await this.commonService.getBlocks(ENV_CONFIG.TOKENLICENSE_SYNC)
      var fBlock = fromBlock;
      if (isExcute) {
        await this.processBlock(fromBlock, toBlock);
        this.commonService.updateStatus(toBlock, ENV_CONFIG.IPASSET_SYNC);        
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
    const ipassetContract = Contract(
      ENV_CONFIG.STORY_PROTOCOL_CONTRACT.IPASSET,
      IPAssetRegistryABI as AbiItem[]
    );

    this._logger.log(`[IpAsset] fromBlock: ` + fromBlock);
    this._logger.log(`[IpAsset] toBlock: ` + toBlock);
    var newIPassets: any = await ipassetContract.getPastEvents('IPRegistered', {fromBlock:fromBlock, toBlock: toBlock})
    const ipaassets = [];
    await Promise.all(newIPassets.map(newIPasset => new Promise(async () => {
      try {
        const ipaasset = new IPAassets();
        ipaasset.contract_address = newIPasset.returnValues.tokenContract;
        ipaasset.token_id = newIPasset.returnValues.tokenId;
        ipaasset.chain_id = newIPasset.returnValues.chainId;
        ipaasset.ip_id = newIPasset.returnValues.ipId;
        ipaasset.name = newIPasset.returnValues.name;
        ipaasset.uri = newIPasset.returnValues.uri;
        ipaasset.registration_date = newIPasset.returnValues.registrationDate;
        ipaassets.push(ipaasset);
      }
      catch (ex) {
          console.error(ex)
      }
    }))) 

    if (ipaassets.length > 0) {
      this._logger.log(`Insert data to database`);
      await this.ipaassetsRepository.upsert(ipaassets, [
        'id',
      ]);
    }    

  }  
}
