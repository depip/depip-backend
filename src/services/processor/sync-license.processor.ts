import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { LicenseTokenRepository } from '../../repositories/licensetoken.repository';
import { ENV_CONFIG } from '../../shared/services/config.service';
import { CommonService } from '../common.service';
import { Contract } from '../../web3';
import LicenseTokenABI from '../../web3/ABI/LicenseToken.json';
import LicenseModuleABI from '../../web3/ABI/LicenseModule.json';
import LicenseRegistryABI from '../../web3/ABI/LicenseRegistry.json';
import { LicenseToken } from '../../entities/license-token.entity';
import { AbiItem } from 'web3';
import { LicenseAttach } from 'src/entities';
import { LicenseAttachRepository } from 'src/repositories/license-attach.repository';
import { IPAssetsRepository } from 'src/repositories/ipasset.repository';

@Processor({ name: ENV_CONFIG.STORY_PROTOCOL_SYNC.LICENSE_SYNC })
export class SyncLicenseProcessor {
  private readonly _logger = new Logger(SyncLicenseProcessor.name);
  constructor(
    private licenseTokenRepository: LicenseTokenRepository,
    private licenseAttachRepository: LicenseAttachRepository,
    private ipAssetRepository: IPAssetsRepository,
    private commonService: CommonService
  ) {}

  @Process({ name: 'syncLicense', concurrency: 1 })
  async cronSync() {
    // Get the highest block and insert into SyncBlock
    try {
      const { fromBlock, toBlock, isExcute } = await this.commonService.getBlocks(
        ENV_CONFIG.STORY_PROTOCOL_SYNC.LICENSE_SYNC
      );
      var fBlock = fromBlock;
      if (isExcute) {
        await this.processBlockSyncLicense(fromBlock, toBlock);
        this.commonService.updateStatus(toBlock + 1, ENV_CONFIG.STORY_PROTOCOL_SYNC.LICENSE_SYNC);
      }
    } catch (error) {
      this._logger.log(`error when generate base blocks:${fBlock}`, error.stack);
      throw error;
    }
  }

  @Process({ name: 'syncLicenseAttach', concurrency: 1 })
  async cronSyncAttach() {
    // Get the highest block and insert into SyncBlock
    try {
      const { fromBlock, toBlock, isExcute } = await this.commonService.getBlocks(
        ENV_CONFIG.STORY_PROTOCOL_SYNC.LICENSE_ATTACH_SYNC
      );
      var fBlock = fromBlock;
      if (isExcute) {
        await this.processBlockSyncLicenseAttach(fromBlock, toBlock);
        this.commonService.updateStatus(toBlock + 1, ENV_CONFIG.STORY_PROTOCOL_SYNC.LICENSE_ATTACH_SYNC);
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
  async processBlockSyncLicense(fromBlock, toBlock) {
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

  async processBlockSyncLicenseAttach(fromBlock, toBlock) {
    const licenseModuleContract = Contract(
      ENV_CONFIG.STORY_PROTOCOL_CONTRACT.LICENSE_MODULE,
      LicenseModuleABI as AbiItem[]
    );

    const licenseRegistryContract = Contract(
      ENV_CONFIG.STORY_PROTOCOL_CONTRACT.LICENSE_REGISTRY,
      LicenseRegistryABI as AbiItem[]
    );
    this._logger.log(`Sync license attach from block ${fromBlock} to block ${toBlock}`);
    var newLicenseAttaches: any = await licenseModuleContract.getPastEvents('LicenseTermsAttached', {
      fromBlock: fromBlock,
      toBlock: toBlock,
    });
    const countLicenseAttachesOnIpId: any = {};
    const licenseAttaches = await Promise.all(
      newLicenseAttaches.map(async (newLicenseAttach) => {
        const licenseAttach = new LicenseAttach();

        licenseAttach.caller = newLicenseAttach.returnValues.caller;
        licenseAttach.ip_id = newLicenseAttach.returnValues.ip_id;
        licenseAttach.license_template = newLicenseAttach.returnValues.license_template;
        licenseAttach.license_term_id = newLicenseAttach.returnValues.license_term_id;

        if (countLicenseAttachesOnIpId[licenseAttach.ip_id] == null) {
          const countAttached = await licenseRegistryContract.methods
            .getAttachedLicenseTermsCount(licenseAttach.ip_id)
            .call();
          countLicenseAttachesOnIpId[licenseAttach.ip_id] = countAttached;
        }
        return licenseAttach;
      })
    );

    await Promise.all(
      Object.keys(countLicenseAttachesOnIpId).map(async (ipId) => {
        const ipassets = await this.ipAssetRepository.findAll({ ipId: ipId });
        await this.ipAssetRepository.getRepository().update(
          { numberLicenseAttached: countLicenseAttachesOnIpId[ipId] },
          {
            ip_id: ipId,
          }
        );
      })
    );

    if (licenseAttaches.length > 0) {
      this._logger.log(`Insert LICENSE ATTACH data to database`);
      await this.licenseAttachRepository.insert(licenseAttaches);
    }
  }
}
