import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { findLast } from 'lodash';
import { ENV_CONFIG } from '../../shared/services/config.service';
import { IpassetService } from '../ipasset/ipasset.service';
import { CommonUtil } from '../../utils/common.util';
import LicenseModuleABI from '../../web3/ABI/LicenseModule.json'
import { PIL_TYPE } from '../../shared/types/license-type';
import * as fs from 'fs';
import path from 'path';

const  licenseModuleABIPath = "../../web3/ABI/LicenseModule.json"

@Injectable()
export class LicenseService {
  private readonly _logger = new Logger(LicenseService.name);
  private licenseModuleAddr: string = ENV_CONFIG.STORY_PROTOCOL_CONTRACT.LICENSE_MODULE;
  private licenseTemplateAddr: string = ENV_CONFIG.STORY_PROTOCOL_CONTRACT.LICENSE_TEMPLATE;
  private licenseModuleAbi = [];
  private licenseModuleContract = null;

  constructor(
    private ipassetService: IpassetService,
    private commonUtil: CommonUtil,
  ) {}  

  async mintLicenses(licensorIpId: string, licenseTermsId: string, receiver: string, amount: number) {
    this._logger.log(`perform registration ipasset! `);
    try {
      // Check registed Ipasset
      const ipIdRegisted = await this.ipassetService.isIpIdRegistered(licensorIpId)
      if (!ipIdRegisted) {
        const errMsg = `licensorIpId: ${licensorIpId} not valid or has not register as Ipasset`;
        this._logger.error(errMsg);
        throw new Error(errMsg); 
      }

      // Connecting to smart contract
      if (!this.licenseModuleContract) {
        if (this.licenseModuleAbi.length == 0) {
          const abiFilePath = path.resolve(__dirname, licenseModuleABIPath);
          const files = fs.readFileSync(abiFilePath);
          this.licenseModuleAbi = JSON.parse(files.toString());
        }
        this.licenseModuleContract = await this.commonUtil.getContract(this.licenseModuleAddr, this.licenseModuleAbi);
        if (!this.licenseModuleContract) {
          const errMsg = `can not get contract licenseModuleContract`;
          this._logger.error(errMsg);
          throw new Error(errMsg);
        }
      }

      // Mint License  
      this._logger.log(`perform to call contract! `);
      const tx = await this.licenseModuleContract.mintLicenseTokens(
        licensorIpId,
        this.licenseTemplateAddr,
        licenseTermsId,
        amount,
        receiver,
        "0x0000000000000000000000000000000000000000"
      );
      const res = await tx.wait();
      if (res.status !== 1) {
        alert('error message');
        return "Mint license fail: " + res.hash
      }else{
        return {
          status: "success",
          tx: res.hash,
        }
      }
    } catch (error) {
      this._logger.log(
        `error when mint license: ${licensorIpId}`,
        error.stack,
      );
      return {
        status: "fail",
        error: error,
      }
    }        
  }
}
