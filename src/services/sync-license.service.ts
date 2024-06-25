import { Injectable, Logger } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { BlockSyncRepository } from '../repositories/block-sync.repository';
import { ENV_CONFIG } from '../shared/services/config.service';
import { CommonUtil } from '../utils/common.util';
import { Contract } from '../web3';
import { AbiItem } from 'web3-utils'
import { LicenseTokenABI } from 'src/web3/ABI/LicenseToken';
import { LicenseToken } from 'src/entities/license-token.entity';
import { LicenseTokenRepository } from 'src/repositories/licensetoken.repository';
import { CommonService } from './common.service';

@Injectable()
export class SyncLicenseService {
  private readonly _logger = new Logger(SyncLicenseService.name);
  private rpc;
  private api;
  private threads = 0;
  private schedulesSync: Array<number> = [];

  isCompleteWrite = false;

  constructor(
    private licenseTokenRepository: LicenseTokenRepository,
    private commonService: CommonService
  ) {
    this._logger.log(
      '============== Constructor License Sync Task Service ==============',
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
        this.commonService.updateStatus(toBlock, ENV_CONFIG.TOKENLICENSE_SYNC);
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
    const licenseTokenContract = Contract(
      ENV_CONFIG.STORY_PROTOCOL_CONTRACT.LICENSE,
      LicenseTokenABI as AbiItem[]
    );
    this._logger.log(`[LICENSE TOKEN] fromBlock: ` + fromBlock);
    this._logger.log(`[LICENSE TOKEN] toBlock: ` + toBlock);
    var newLicenseTokens: any = await licenseTokenContract.getPastEvents('LicenseTokenMinted', { fromBlock: fromBlock, toBlock: toBlock })
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
