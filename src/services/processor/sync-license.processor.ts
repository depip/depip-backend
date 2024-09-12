import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { LicenseTokenRepository } from '../../repositories/licensetoken.repository';
import { ENV_CONFIG } from '../../shared/services/config.service';
import { CommonService } from '../common.service';
import { Contract } from '../../web3';
import LicenseTokenABI from '../../web3/ABI/LicenseToken.json';
import { LicenseToken } from '../../entities/license-token.entity';
import { AbiItem } from 'web3';

@Processor({ name: ENV_CONFIG.STORY_PROTOCOL_SYNC.LICENSE_SYNC })
export class SyncLicenseProcessor {
  private readonly _logger = new Logger(SyncLicenseProcessor.name);
  constructor(private licenseTokenRepository: LicenseTokenRepository, private commonService: CommonService) {}

  @Process({ name: 'syncLicense', concurrency: 1 })
  async cronSync() {
    // Get the highest block and insert into SyncBlock
    try {
      const { fromBlock, toBlock, isExcute } = await this.commonService.getBlocks(
        ENV_CONFIG.STORY_PROTOCOL_SYNC.LICENSE_SYNC
      );
      var fBlock = fromBlock;
      if (isExcute) {
        await this.processBlock(fromBlock, toBlock);
        this.commonService.updateStatus(toBlock + 1, ENV_CONFIG.STORY_PROTOCOL_SYNC.LICENSE_SYNC);
      }
    } catch (error) {
      this._logger.log(`error when generate base blocks:${fBlock}`, error.stack);
      throw error;
    }
  }

  /**
   * Process block
   * @param newLastBlock
   */
  async processBlock(fromBlock, toBlock) {
    const licenseTokenContract = Contract(ENV_CONFIG.STORY_PROTOCOL_CONTRACT.LICENSE, LicenseTokenABI as AbiItem[]);
    this._logger.log(`Sync license from block ${fromBlock} to block ${toBlock}`);
    var newLicenseTokens: any = await licenseTokenContract.getPastEvents('LicenseTokenMinted', {
      fromBlock: fromBlock,
      toBlock: toBlock,
    });
    const licenseTokens = await Promise.all(
      newLicenseTokens.map(async (newLicenseToken) => {
        const licenseToken = new LicenseToken();
        licenseToken.signature = newLicenseToken.signature;
        licenseToken.minter = newLicenseToken.returnValues.minter;
        licenseToken.receiver = newLicenseToken.returnValues.receiver;
        licenseToken.token_id = newLicenseToken.returnValues.tokenId;

        const licensorIpId = await licenseTokenContract.methods.getLicensorIpId(licenseToken.token_id).call();
        if (typeof licensorIpId !== 'string') {
          throw Error('licensor ip id is not string');
        }
        licenseToken.licensor_ip_id = licensorIpId;
        return licenseToken;
      })
    );

    if (licenseTokens.length > 0) {
      this._logger.log(`Insert LICENSE TOKEN data to database`);
      await this.licenseTokenRepository.upsert(licenseTokens, ['id']);
    }
  }
}
