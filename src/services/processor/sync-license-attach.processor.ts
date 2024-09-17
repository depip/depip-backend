import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { ENV_CONFIG } from '../../shared/services/config.service';
import { CommonService } from '../common.service';
import { Contract } from '../../web3';
import LicenseModuleABI from '../../web3/ABI/LicenseModule.json';
import LicenseRegistryABI from '../../web3/ABI/LicenseRegistry.json';
import { AbiItem } from 'web3';
import { LicenseAttach } from 'src/entities';
import { LicenseAttachRepository } from 'src/repositories/license-attach.repository';
import { IPAssetsRepository } from 'src/repositories/ipasset.repository';

@Processor({ name: ENV_CONFIG.STORY_PROTOCOL_SYNC.LICENSE_ATTACH_SYNC })
export class SyncLicenseAttachProcessor {
  private readonly _logger = new Logger(SyncLicenseAttachProcessor.name);
  constructor(
    private licenseAttachRepository: LicenseAttachRepository,
    private ipAssetRepository: IPAssetsRepository,
    private commonService: CommonService
  ) {}

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
        await this.commonService.updateStatus(toBlock + 1, ENV_CONFIG.STORY_PROTOCOL_SYNC.LICENSE_ATTACH_SYNC);
      }
    } catch (error) {
      this._logger.error(`error when generate base blocks:${fBlock}`, error.stack);
      throw error;
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
        licenseAttach.ip_id = newLicenseAttach.returnValues.ipId;
        licenseAttach.license_template = newLicenseAttach.returnValues.licenseTemplate;
        licenseAttach.license_term_id = newLicenseAttach.returnValues.licenseTermsId;

        if (countLicenseAttachesOnIpId[licenseAttach.ip_id] == null) {
          const countAttached = await licenseRegistryContract.methods
            .getAttachedLicenseTermsCount(licenseAttach.ip_id)
            .call();
          countLicenseAttachesOnIpId[licenseAttach.ip_id] = countAttached;
        }
        return licenseAttach;
      })
    );

    try {
      await Promise.all(
        Object.keys(countLicenseAttachesOnIpId).map(async (ipId) => {
          await this.ipAssetRepository.getRepository().update(
            {
              ip_id: ipId,
            },
            { number_license_attached: Number(countLicenseAttachesOnIpId[ipId]) }
          );
        })
      );
    } catch (error) {
      this._logger.error(error);
    }

    if (licenseAttaches.length > 0) {
      this._logger.log(`Insert LICENSE ATTACH data to database`);
      await this.licenseAttachRepository.insert(licenseAttaches);
    }
  }
}
