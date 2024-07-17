import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { RequestHandlerInput, REQUEST_TYPE } from './dto/requestHandler-input.dto';
import { IpassetService } from '../ipasset/ipasset.service';
import { LicenseService } from '../license/license.service';
import { LicenseTermsService } from '../licenseTerms/licenseTerms.service';

@Injectable()
export class RequestHandlerService {
  private readonly _logger = new Logger(RequestHandlerService.name);
  constructor(
    private ipassetService: IpassetService,
    private licenseService: LicenseService,
    private licenseTermsService: LicenseTermsService,
  ) {}  

  async requestHandle(requestData: RequestHandlerInput) {
    this._logger.log(`perform requestHandle! `);
    try {
      if(requestData.requestType == REQUEST_TYPE.REGISTER_IPASSET){
        return await this.ipassetService.registerIpasset
        ( 
          requestData.ipasset.nftAddress, 
          requestData.ipasset.tokenId
        );
      } else if(requestData.requestType == REQUEST_TYPE.REGISTER_PIL_TERM){
        return await this.licenseTermsService.registerPILTerms
        (
          requestData.pilTerm.pilType, 
          requestData.pilTerm.mintingFee, 
          requestData.pilTerm.currency
        );
      } else if(requestData.requestType == REQUEST_TYPE.ATTACH_PIL_TERM){
        return await this.licenseTermsService.attackPILTerms
        (
          requestData.pilTerm.licensorIpId, 
          requestData.pilTerm.termId, 
        );
      } else if(requestData.requestType == REQUEST_TYPE.MINT_LICENSE_TOKEN){
        return await this.licenseService.mintLicenses
        (
          requestData.license.licensorIpId, 
          requestData.license.licenseTermsId, 
          requestData.license.receiver, 
          requestData.license.amount
        );
      } else {
        return {
          status: "fail",
          error: "Not support request action!",
        }
      }
    } catch (error) {
      this._logger.log(
        `error when process request :${error}`,
        error.stack,
      );
      return {
        status: "fail",
        error: error,
      }
    }       
  }
}
