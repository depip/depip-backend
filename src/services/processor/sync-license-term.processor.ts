import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { ENV_CONFIG } from '../../shared/services/config.service';
import { CommonService } from '../common.service';
import { Contract } from '../../web3';
import LicenseTemplateABI from '../../web3/ABI/LicenseTemplate.json';
import { AbiItem } from 'web3';
import { omit } from 'lodash';
import { LicenseTermRepository } from 'src/repositories';
import { LicenseTerm } from 'src/entities';
import { Job } from 'bull';

@Processor({ name: ENV_CONFIG.STORY_PROTOCOL_SYNC.LICENSE_TERM_SYNC })
export class SyncLicenseTermProcessor {
  private readonly _logger = new Logger(SyncLicenseTermProcessor.name);
  constructor(private licenseTermRepository: LicenseTermRepository, private commonService: CommonService) {}

  @Process({ name: 'syncLicenseTerm' })
  async cronSync() {
    // Get the highest block and insert into SyncBlock
    try {
      const { fromBlock, toBlock, isExcute } = await this.commonService.getBlocks(
        ENV_CONFIG.STORY_PROTOCOL_SYNC.LICENSE_TERM_SYNC
      );
      var fBlock = fromBlock;
      if (isExcute) {
        await this.processBlockSyncLicenseTerm(fromBlock, toBlock);
        await this.commonService.updateStatus(toBlock + 1, ENV_CONFIG.STORY_PROTOCOL_SYNC.LICENSE_TERM_SYNC);
      }
    } catch (error) {
      this._logger.error(`error when generate base blocks:${fBlock}`, error.stack);
      throw error;
    }
  }

  /**
   * Process block
   * @param newLastBlock
   */
  async processBlockSyncLicenseTerm(fromBlock, toBlock) {
    const licenseTokenContract = Contract(
      ENV_CONFIG.STORY_PROTOCOL_CONTRACT.LICENSE_TEMPLATE,
      LicenseTemplateABI as AbiItem[]
    );
    this._logger.log(`Sync license term from block ${fromBlock} to block ${toBlock}`);
    var newLicenseTerms: any = await licenseTokenContract.getPastEvents('LicenseTermsRegistered', {
      fromBlock: fromBlock,
      toBlock: toBlock,
    });
    const licenseTerms = await Promise.all(
      newLicenseTerms.map(async (newLicenseTerm) => {
        const licenseTermDetail: any = await licenseTokenContract.methods
          .getLicenseTerms(newLicenseTerm.returnValues.licenseTermsId)
          .call();

        const licenseTermDetailFormatted = omit(licenseTermDetail, [
          ...Array(licenseTermDetail.__length__).keys(),
          '__length__',
        ]);
        const licenseTerm = new LicenseTerm();

        licenseTerm.license_term_id = newLicenseTerm.returnValues.licenseTermsId;
        licenseTerm.license_template = newLicenseTerm.returnValues.licenseTemplate;
        licenseTerm.license_term_detail = JSON.parse(
          JSON.stringify(licenseTermDetailFormatted, (key, value) =>
            typeof value === 'bigint' ? value.toString() : value
          )
        );
        licenseTerm.name = this.getNameForLicense(licenseTerm.license_term_detail);
        return licenseTerm;
      })
    );
    if (licenseTerms.length > 0) {
      this._logger.log(`Insert LICENSE TERM data to database`);
      await this.licenseTermRepository.insert(licenseTerms);
    }
  }

  @Process({ name: 'syncLicenseTermById' })
  async syncLicenseTermById(
    job: Job<{
      licenseTermId: number;
    }>
  ) {
    this._logger.log(`Sync license term by ID ${job.data.licenseTermId}`);
    // Get the highest block and insert into SyncBlock
    try {
      const foundDB = await this.licenseTermRepository
        .getRepository()
        .findOne({ where: { license_term_id: job.data.licenseTermId } });
      if (foundDB) {
        this._logger.log(`License term ID ${job.data.licenseTermId} was found on DB`);
        return;
      }

      const licenseTokenContract = Contract(
        ENV_CONFIG.STORY_PROTOCOL_CONTRACT.LICENSE_TEMPLATE,
        LicenseTemplateABI as AbiItem[]
      );
      const licenseTermDetail: any = await licenseTokenContract.methods.getLicenseTerms(job.data.licenseTermId).call();

      const licenseTermDetailFormatted = omit(licenseTermDetail, [
        ...Array(licenseTermDetail.__length__).keys(),
        '__length__',
      ]);
      const licenseTerm = new LicenseTerm();
      licenseTerm.license_term_id = job.data.licenseTermId;
      licenseTerm.license_template = ENV_CONFIG.STORY_PROTOCOL_CONTRACT.LICENSE_TEMPLATE;
      licenseTerm.license_term_detail = JSON.parse(
        JSON.stringify(licenseTermDetailFormatted, (key, value) =>
          typeof value === 'bigint' ? value.toString() : value
        )
      );
      licenseTerm.name = this.getNameForLicense(licenseTerm.license_term_detail);
      await this.licenseTermRepository.insert(licenseTerm);
    } catch (error) {
      this._logger.error(error);
      throw error;
    }
  }

  getNameForLicense(licenseDetail: any) {
    if (!licenseDetail.commercialUse) {
      return 'Non-Commercial Social Remixing';
    }
    if (licenseDetail.commercialRevShare == '0') {
      return 'Commercial Use';
    } else {
      return 'Commercial Remix';
    }
  }
}
