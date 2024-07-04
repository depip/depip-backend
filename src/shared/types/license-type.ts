import { TxOptions } from "./options-type";

export type LicenseApiResponse = {
  data: License;
};

export type License = {
  id: string;
  policyId: string;
  licensorIpId: string;
};

export type RegisterNonComSocialRemixingPILRequest = {
  txOptions?: TxOptions;
};

export type LicenseTerms = {
  mintingFee: bigint;
  expiration: bigint;
  commercialRevCelling: bigint;
  derivativeRevCelling: bigint;
  commercializerCheckerData: string;
  transferable: boolean;
  royaltyPolicy: string;
  commercialUse: boolean;
  commercialAttribution: boolean;
  commercializerChecker: string;
  commercialRevShare: number;
  derivativesAllowed: boolean;
  derivativesAttribution: boolean;
  derivativesApproval: boolean;
  derivativesReciprocal: boolean;
  currency: string;
  uri: string;
};
export type LicenseTermsIdResponse = bigint;

export type RegisterPILResponse = {
  licenseTermsId?: bigint;
  txHash?: string;
};

export type RegisterCommercialUsePILRequest = {
  mintingFee: string | number | bigint;
  currency: string;
  txOptions?: TxOptions;
};

export type RegisterCommercialRemixPILRequest = {
  mintingFee: string | number | bigint;
  commercialRevShare: number;
  currency: string;
  txOptions?: TxOptions;
};

export type AttachLicenseTermsRequest = {
  ipId: string;
  licenseTermsId: string | number | bigint;
  licenseTemplate?: string;
  txOptions?: TxOptions;
};

export type AttachLicenseTermsResponse = {
  txHash: string;
  success?: boolean;
};

export type MintLicenseTokensRequest = {
  licensorIpId: string;
  licenseTermsId: string | number | bigint;
  licenseTemplate?: string;
  amount?: number | string | bigint;
  receiver?: string;
  txOptions?: TxOptions;
};

export type MintLicenseTokensResponse = {
  licenseTokenIds?: bigint[];
  txHash?: string;
};

export enum PIL_TYPE {
  NON_COMMERCIAL_REMIX,
  COMMERCIAL_USE,
  COMMERCIAL_REMIX,
}

export type LicenseTermsId = string | number | bigint;