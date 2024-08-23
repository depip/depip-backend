import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ENV_CONFIG } from '../../shared/services/config.service';
import { getLicenseTermByType } from '../../utils/getLicenseTermsByType';
import { CommonUtil } from '../../utils/common.util';
import LicenseTemplateABI from '../../web3/ABI/LicenseTemplate.json'
import LicenseRegistryABI from '../../web3/ABI/LicenseRegistry.json'
import LicenseModuleABI from '../../web3/ABI/LicenseModule.json'
import { SmartAccountService } from '../particleAccounts/smartAccount.service';
import { SPGService } from '../spg/spg.service';

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
    private commonUtil: CommonUtil,
    private smartAccountService: SmartAccountService,
  ) {
    
  }  
  private sleep = ms => new Promise(resolve => setTimeout(resolve, ms))
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

  async attackPILTerms(ipId, termId, session, userWallet) {
    try {
      // Connecting to smart contract
      if (!this.licenseRegistryContract) {
        // if (this.licenseRegistryAbi.length == 0) {
        //   const abiFilePath = path.resolve(__dirname, licenseRegistryABIPath);
        //   const files = fs.readFileSync(abiFilePath);
        //   this.licenseRegistryAbi = JSON.parse(files.toString());
        // }

        this.licenseRegistryContract = await this.commonUtil.getContract(this.licenseRegistryAddr, LicenseRegistryABI);
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
          this.licenseModuleContract = await this.commonUtil.getContract(this.licenseModuleAddr, LicenseModuleABI);
          if (!this.licenseModuleContract) {
            const errMsg = `can not get licenseModuleContract`;
            this._logger.error(errMsg);
            throw new Error(errMsg);
          }
        }   

        // const smartAccount = await this.smartAccountService.getSmartAccount(userWallet);
        // console.log("smartAccount: " + JSON.stringify(smartAccount));
        // await this.spgService.setPermission(ipId, smartAccount.result.smartAccountAddress, 1, userWallet, session);
        
        const txRaw = await this.licenseModuleContract.attachLicenseTerms.populateTransaction(ipId, this.licenseTemplateAddr, termId);
        const txSigned = await this.smartAccountService.signAndSendTx(userWallet, txRaw, session)   
        
        if (txSigned.error) {
          // alert('error message');
          return {
            status: "fail",
            error: txSigned.error.data.extraMessage
          }
  
        }else{
          return {
            status: "success",
            tx: txSigned.result,
          }
        }        

        // Attack PIL terms
        // const txHash = await this.licenseModuleContract.attachLicenseTerms(ipId, this.licenseTemplateAddr, termId);
        // const res = await txHash.wait();
        // if (res.status !== 1) {
        //   alert('error message');
        //   return "Register fail: " + res.hash
        // }else{
        //   return {
        //     status: "success",
        //     tx: res.hash,
        //   }
        // }      
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

  async registerPILTerms(pilType, mintingFee, currency, session, revShare, userWallet) {
    this._logger.log(`perform registerPILTerms! `);
    try {
      // Connecting to smart contract
      if (!this.licenseTemplateContract) {
        this.licenseTemplateContract = await this.commonUtil.getContract(this.licenseTemplateAddr, LicenseTemplateABI);
        if (!this.licenseTemplateContract) {
          const errMsg = `can not get licenseTemplateContract`;
          this._logger.error(errMsg);
          throw new Error(errMsg);
        }
      }

      const licenseTerms = getLicenseTermByType(pilType, {
        mintingFee: mintingFee,
        currency: currency,
        commercialRevShare: Number(revShare),
        royaltyPolicyLAPAddress: ENV_CONFIG.STORY_PROTOCOL_CONTRACT.ROYALTY_POLICYLAP,
      });

      this._logger.log(`revShare: ` + revShare);
      this._logger.log(`mintingFee: ` + mintingFee);
      // const json = JSON.stringify(licenseTerms, 
      //   (k, v) => typeof v === 'bigint' ? 'BIGINT_' + v : v
      // ).replace(/"BIGINT_(\d+)"/g, '$1');
      // console.log("licenseTerms: " + json)
      // PIL Term Existed
      const licenseTermsId = await this.licenseTemplateContract.getLicenseTermsId(licenseTerms);
      this._logger.log(`licenseTermsId: ` + licenseTermsId);
      if (licenseTermsId != 0) {
        return {
          status: "success",
          termId: Number(licenseTermsId),
        }
      }
      // Register PIL terms

      const txRaw = await this.licenseTemplateContract.registerLicenseTerms.populateTransaction(licenseTerms);
      const txSigned = await this.smartAccountService.signAndSendTx(userWallet, txRaw, session)   
      
      if (txSigned.error) {
        // alert('error message');
        return {
          status: "fail",
          error: txSigned.error.data.extraMessage
        }

      }else{
        await this.sleep(15000)
        let licenseTermsIdNew = 0
        do {
          licenseTermsIdNew = await this.licenseTemplateContract.getLicenseTermsId(licenseTerms);
        } while (licenseTermsIdNew == 0);

        return {
          status: "success",
          tx: txSigned.result,
          termId: Number(licenseTermsIdNew),
        }
      } 

      // const txHash = await this.licenseTemplateContract.registerLicenseTerms(licenseTerms);
      // const res = await txHash.wait();
      // if (res.status !== 1) {
      //   return {
      //     status: "fail",
      //     error: res.hash,
      //   }
      // }else{
      //   const licenseTermsIdNew = await this.licenseTemplateContract.getLicenseTermsId(licenseTerms);
      //   return {
      //     status: "success",
      //     termId: Number(licenseTermsIdNew),
      //   }        
      // }


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
