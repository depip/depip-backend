import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { findLast } from 'lodash';
import { ENV_CONFIG } from '../../shared/services/config.service';
import { IpassetService } from '../ipasset/ipasset.service';
import { getLicenseTermByType } from '../../utils/getLicenseTermsByType';
import { PIL_TYPE } from '../../shared/types/license-type';
import { CommonUtil } from '../../utils/common.util';
import LicenseTemplateABI from '../../web3/ABI/LicenseTemplate.json'
import LicenseRegistryABI from '../../web3/ABI/LicenseRegistry.json'
import LicenseModuleABI from '../../web3/ABI/LicenseModule.json'
import * as fs from 'fs';
import path from 'path';

const  licenseTemplateABIPath = "../../web3/ABI/LicenseTemplate.json"
const  licenseRegistryABIPath = "../../web3/ABI/LicenseRegistry.json"
const  licenseModuleABIPath = "../../web3/ABI/LicenseModule.json"

@Injectable()
export class LicenseTermsService {
  private readonly _logger = new Logger(LicenseTermsService.name);
  private licenseRegistryAddr: string = ENV_CONFIG.STORY_PROTOCOL_CONTRACT.LICENSE_REGISTRY;
  private licenseTemplateAddr: string = ENV_CONFIG.STORY_PROTOCOL_CONTRACT.LICENSE_TEMPLATE;
  private licenseModuleAddr: string = ENV_CONFIG.STORY_PROTOCOL_CONTRACT.LICENSE_MODULE;
  private licenseRegistryAbi = [];
  private licenseTemplateAbi = [];
  private licenseModuleAbi = [];
  private licenseTemplateContract = null;
  private licenseRegistryContract = null;
  private licenseModuleContract = null;

  constructor(
    private commonUtil: CommonUtil
  ) {}  

  // async registerLicenseTerms(ipId: string, type: PIL_TYPE, mintingFee: number, currency: string) {
  //   try {
  //     this._logger.log(`perform register License Terms! `);
  //     // Check PIL Terms
  //     const licenseTermsId = await this.registerPILTerms(type, mintingFee, currency);
  //     console.log("licenseTermsId: " + licenseTermsId)
  //     // Register PIL terms

  //     // Attack PIL terms
  //     const result = await this.attackPILTerms(ipId, licenseTermsId);
  //   } catch (error) {
  //     this._logger.log(
  //       `error when register License Terms: ${ipId}`,
  //       error.stack,
  //     );
  //     return {
  //       status: "fail",
  //       error: error,
  //     }
  //   }       
  // }

  async attackPILTerms(ipId, termId) {
    try {
      // Connecting to smart contract
      if (!this.licenseRegistryContract) {
        if (this.licenseRegistryAbi.length == 0) {
          const abiFilePath = path.resolve(__dirname, licenseRegistryABIPath);
          const files = fs.readFileSync(abiFilePath);
          this.licenseRegistryAbi = JSON.parse(files.toString());
        }

        this.licenseRegistryContract = await this.commonUtil.getContract(this.licenseRegistryAddr, this.licenseRegistryAbi);
        if (!this.licenseRegistryContract) {
          const errMsg = `can not get licenseRegistryContract`;
          this._logger.error(errMsg);
          throw new Error(errMsg);
        }
      } 

      const isAttachedLicenseTerms = await this.licenseRegistryContract.hasIpAttachedLicenseTerms(ipId, this.licenseTemplateAddr, termId);

      if (isAttachedLicenseTerms) {
        return {
          status: "success",
          tx: "",
        }
      }else{
        // Connecting to smart contract
        if (!this.licenseModuleContract) {
          if (this.licenseModuleAbi.length == 0) {
            const abiFilePath = path.resolve(__dirname, licenseModuleABIPath);
            const files = fs.readFileSync(abiFilePath);
            this.licenseModuleAbi = JSON.parse(files.toString());
          }

          this.licenseModuleContract = await this.commonUtil.getContract(this.licenseModuleAddr, this.licenseModuleAbi);
          if (!this.licenseModuleContract) {
            const errMsg = `can not get licenseModuleContract`;
            this._logger.error(errMsg);
            throw new Error(errMsg);
          }
        }       
        // Attack PIL terms
        const txHash = await this.licenseModuleContract.attachLicenseTerms(ipId, this.licenseTemplateAddr, termId);
        const res = await txHash.wait();
        if (res.status !== 1) {
          alert('error message');
          return "Register fail: " + res.hash
        }else{
          return {
            status: "success",
            tx: res.hash,
          }
        }      
      }
    } catch (error) {
      this._logger.log(
        `error when attack PIL Terms: ${termId}`,
        error.stack,
      );
      return {
        status: "fail",
        error,
      };
    }        
  }    

  async registerPILTerms(pilType, mintingFee, currency) {
    this._logger.log(`perform registerPILTerms! `);
    try {
      // Connecting to smart contract
      if (!this.licenseTemplateContract) {
        if (this.licenseTemplateAbi.length == 0) {
          const abiFilePath = path.resolve(__dirname, licenseTemplateABIPath);
          const files = fs.readFileSync(abiFilePath);
          this.licenseTemplateAbi = JSON.parse(files.toString());
        }

        this.licenseTemplateContract = await this.commonUtil.getContract(this.licenseTemplateAddr, this.licenseTemplateAbi);
        if (!this.licenseTemplateContract) {
          const errMsg = `can not get licenseTemplateContract`;
          this._logger.error(errMsg);
          throw new Error(errMsg);
        }
      }

      const licenseTerms = getLicenseTermByType(pilType, {
        mintingFee: mintingFee,
        currency: currency,
        commercialRevShare: 12,
        royaltyPolicyLAPAddress: ENV_CONFIG.STORY_PROTOCOL_CONTRACT.ROYALTY_POLICYLAP,
      });
      // const json = JSON.stringify(licenseTerms, 
      //   (k, v) => typeof v === 'bigint' ? 'BIGINT_' + v : v
      // ).replace(/"BIGINT_(\d+)"/g, '$1');
      // console.log("licenseTerms: " + json)
      // PIL Term Existed
      const licenseTermsId = await this.licenseTemplateContract.getLicenseTermsId(licenseTerms);
      
      if (licenseTermsId != 0) {
        return {
          status: "success",
          termId: Number(licenseTermsId),
        }
      }
      // Register PIL terms
      const txHash = await this.licenseTemplateContract.registerLicenseTerms(licenseTerms);
      const res = await txHash.wait();
      if (res.status !== 1) {
        return {
          status: "fail",
          error: res.hash,
        }
      }else{
        const licenseTermsIdNew = await this.licenseTemplateContract.getLicenseTermsId(licenseTerms);
        return {
          status: "success",
          termId: Number(licenseTermsIdNew),
        }        
      }
    } catch (error) {
      this._logger.log(
        `error when register PIL Terms`,
        error.stack,
      );
      return {
        status: "fail",
        error: error,
      }
    }        
  }   
}
