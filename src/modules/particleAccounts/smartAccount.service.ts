import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ENV_CONFIG } from '../../shared/services/config.service';
import axios from 'axios';
const chainId = 11155111; // Network
const projectId = '0a851b67-3111-447c-be4a-f9efd85975e0';
const projectServerKey = 'cIsfPnSBIDs5YB9RWVt7h91IC0zpckyBNtZTa04o';
const nft1155ContractAddress = "0xC79b817AcA1395D2Ae45809E63AF338E6C2903F5";
import { Wallet, Contract, ethers, Interface } from "ethers";
const { Utils } = require("alchemy-sdk");

@Injectable()
export class SmartAccountService implements OnModuleInit {
  private readonly logger = new Logger(SmartAccountService.name);
  private provider = new ethers.JsonRpcProvider(ENV_CONFIG.NODE.RPC);
  private mainSigner = new Wallet("ad5f4007518e151531e410e9692345806ebfb12c2683de4f4345273d7c31fd89", this.provider);
  private sessionSigner = new Wallet(ENV_CONFIG.MASTERWALLET, this.provider)
  // private mainSigner = Wallet.createRandom();
  private smartAccount = { name: "BICONOMY", version: "2.0.0", ownerAddress: this.mainSigner.address };


  onModuleInit() {
  }

  async getAccountInfor() {
    const headers = ({
        'content-type': 'application/json',
      });
    try {
      const response = await axios.post(`${ENV_CONFIG.PARTICAL_NETWORK.PARTICAL_RPC_URL}${chainId}`, {
        jsonrpc: "2.0",
        id: "ee9cce2a-2f34-4c66-879e-c84c6f0e7f2d",
        method: 'particle_aa_getSmartAccount',
        params: [
          // account config
          this.smartAccount
        ],
      }, 
      {
          auth: {
              username: projectId,
              password: projectServerKey,
          },
      });

      console.log("smartAccount: " + JSON.stringify(response.data));

      let sessionsRaw: any[] = [
            {
                "validUntil": 0,
                "validAfter": 0,
                "sessionValidationModule": "0xB4AFbE412FD10cF1BFd57c5dcccdbE391352CF1b",
                "sessionKeyDataInAbi": [ // or use sessionKeyData to replace
                    ["address", "address", "uint256"],
                    [
                      this.sessionSigner.address, // session signer address
                      this.sessionSigner.address, // receiver address
                      100, // nft token id
                    ]
                ]
            }
          ]; 

    const resCreateSessions = await this.createSessions(this.smartAccount, sessionsRaw)

          // we use gasless mode
    const userOpA = resCreateSessions.result.verifyingPaymasterGasless.userOp;
    const userOpHashA = resCreateSessions.result.verifyingPaymasterGasless.userOpHash;
    const sessions = resCreateSessions.result.sessions; // the sessions you need to store locally
    userOpA.signature = await this.mainSigner.signMessage(Utils.arrayify(userOpHashA));

    await axios.post(`${ENV_CONFIG.PARTICAL_NETWORK.PARTICAL_RPC_URL}${chainId}`, {
        method: "particle_aa_sendUserOp",
        params: [this.smartAccount, userOpA],
    }, 
    {
        auth: {
            username: projectId,
            password: projectServerKey,
        },
    });


    // const sessions = session.sessions;
    console.log("sessions: " + JSON.stringify(sessions));
    // console.log("resSendUserOpA: " + JSON.stringify(resSendUserOpA.data));

    // const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))
    // await sleep(15000)

    // const erc1155Contract = new Contract(nft1155ContractAddress, ["function mintTo(address, uint256, uint256) public"], this.provider);
    // const tx = await erc1155Contract.mintTo.populateTransaction("0x7c756cba10ff2c65016494e8ba37c12a108572b5", 1, 1);

    // const resGetFeeQuotes = await this.getFeeQuotes(this.smartAccount, tx)

    // console.log("tx: " + JSON.stringify(tx));
    // // console.log("resGetFeeQuotes: " + JSON.stringify(resGetFeeQuotes));
    // const userOp = resGetFeeQuotes.result.verifyingPaymasterGasless.userOp;
    // const userOpHash = resGetFeeQuotes.result.verifyingPaymasterGasless.userOpHash;
    // userOp.signature = await this.sessionSigner.signMessage(Utils.arrayify(userOpHash));

    // // const userOp = await this.createUserOp(this.smartAccount, tx)
    // // const userOpHash = userOp.userOpHash;
    // // userOp.userOp.signature = await this.mainSigner.signMessage(Utils.arrayify(userOpHash));
    
    // const resSendUserOp = await axios.post(`${ENV_CONFIG.PARTICAL_NETWORK.PARTICAL_RPC_URL}${chainId}`, {
    //   method: "particle_aa_sendUserOp",
    //   params: [
    //     this.smartAccount, 
    //     userOp,        
    //     {
    //     sessions, // all sessions to generate proof
    //     targetSession: sessions[0], // which session to use in this userOp
    //     },
    //   ],
    // },
    //   {
    //     auth: {
    //         username: projectId,
    //         password: projectServerKey,
    //     },
    // });
    // console.log("resSendUserOp: " + JSON.stringify(resSendUserOp.data));

    } catch (error) {
      const errorMsg = `Error while call from particle! ${error}`;
      throw new Error(errorMsg);
    }
  }

  async createUserOp(account, txs) {
    const headers = ({
        'content-type': 'application/json',
      });

    try {
      const response = await axios.post(`${ENV_CONFIG.PARTICAL_NETWORK.PARTICAL_RPC_URL}${chainId}`, {
        jsonrpc: "2.0",
        id: "ee9cce2a-2f34-4c66-879e-c84c6f0e7f2d",
        method: 'particle_aa_createUserOp',
        params: [
          // account config
          account,
          // txs
          [
            txs
          ],
          // // optional: If you don't pass the following params, it'll create a gasless/user paid user op
          // // token feeQuote
          // {
          //   "tokenInfo": {
          //     "chainId": 80001,
          //     "name": "WMATIC",
          //     "symbol": "WMATIC",
          //     "decimals": 18,
          //     "address": "0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889",
          //     "logoURI": "https://polygonscan.com/token/images/wMatic_32.png"
          //   },
          //   "fee": "374428266633331",
          //   "balance": "1019119852023946296",
          //   "premiumPercentage": "10"
          // },
          // // token paymaster address
          // "0x00000f7365cA6C59A2C93719ad53d567ed49c14C"                    
        ],
      }, {
          auth: {
              username: projectId,
              password: projectServerKey,
          },
      });

      console.log("createUserOp: " + JSON.stringify(response.data));
      return response.data.result
    } catch (error) {
      const errorMsg = `Error while call from particle! ${error}`;
      throw new Error(errorMsg);
    }
  }

  async signAndSendTx(account, txs, sessions) {
    try {
      const smartAccount = { name: "BICONOMY", version: "2.0.0", ownerAddress: account };
      const resGetFeeQuotes = await this.getFeeQuotes(smartAccount, txs)

      if(!resGetFeeQuotes.error){
        const userOp = resGetFeeQuotes.result.verifyingPaymasterGasless.userOp;
        const userOpHash = resGetFeeQuotes.result.verifyingPaymasterGasless.userOpHash;
        userOp.signature = await this.sessionSigner.signMessage(Utils.arrayify(userOpHash));
  
        const resSendUserOp = await axios.post(`${ENV_CONFIG.PARTICAL_NETWORK.PARTICAL_RPC_URL}${chainId}`, {
          method: "particle_aa_sendUserOp",
          params: [
            smartAccount, 
            userOp,        
            {
            sessions, // all sessions to generate proof
            targetSession: sessions[0], // which session to use in this userOp
            },
          ],
        },
          {
            auth: {
                username: projectId,
                password: projectServerKey,
            },
        });
        console.log("resSendUserOp: " + JSON.stringify(resSendUserOp.data));
        return resSendUserOp.data
      } else {
        return resGetFeeQuotes
      }
    } catch (error) {
      const errorMsg = `Error while call from particle! ${error}`;
      throw new Error(errorMsg);
    }
  }  


  async sendUserOp(account, userOp, sessions) {
    try {
      const response = await axios.post(`${ENV_CONFIG.PARTICAL_NETWORK.PARTICAL_RPC_URL}${chainId}`, {
        jsonrpc: "2.0",
        id: "ee9cce2a-2f34-4c66-879e-c84c6f0e7f2d",
        method: 'particle_aa_sendUserOp',
        params: [
          // account config
          account,
          // user op
          userOp,
          // // Optional
          {
            sessions,
            targetSession: sessions[0],
          }  
        ],
      }, {
          auth: {
              username: projectId,
              password: projectServerKey,
          },
      });

      // console.log(response);
      return response.data
    } catch (error) {
      const errorMsg = `Error while call from particle! ${error}`;
      throw new Error(errorMsg);
    }
  }  

  async getFeeQuotes(account, txs) {
    try {
      const response = await axios.post(`${ENV_CONFIG.PARTICAL_NETWORK.PARTICAL_RPC_URL}${chainId}`, {
        jsonrpc: "2.0",
        id: "ee9cce2a-2f34-4c66-879e-c84c6f0e7f2d",
        method: 'particle_aa_getFeeQuotes',
        params: [
          // account config
          account,
          // txs
          [
            txs
          ]              
        ],
      }, {
          auth: {
              username: projectId,
              password: projectServerKey,
          },
      });
      console.log("response.data: " + JSON.stringify(response.data))
      return response.data
    } catch (error) {
      const errorMsg = `Error while call from particle! ${error}`;
      throw new Error(errorMsg);
    }
  }

  async validateSession(account, sessions) {
    const headers = ({
        'content-type': 'application/json',
      });

    try {
      const response = await axios.post(`${ENV_CONFIG.PARTICAL_NETWORK.PARTICAL_RPC_URL}${chainId}`, {
        jsonrpc: "2.0",
        id: "ee9cce2a-2f34-4c66-879e-c84c6f0e7f2d",
        method: 'particle_aa_validateSession',
        params: [
          // account config
          account,
          {
            "sessions": sessions,
            "targetSession": sessions[0]
          }             
        ],
      }, {
          auth: {
              username: projectId,
              password: projectServerKey,
          },
      });

      console.log(response.data);
    } catch (error) {
      const errorMsg = `Error while call from particle! ${error}`;
      throw new Error(errorMsg);
    }
  }

  async createSessions(account, session) {
    const headers = ({
        'content-type': 'application/json',
      });

    try {
      const response = await axios.post(`${ENV_CONFIG.PARTICAL_NETWORK.PARTICAL_RPC_URL}${chainId}`, {
        jsonrpc: "2.0",
        id: "ee9cce2a-2f34-4c66-879e-c84c6f0e7f2d",
        method: 'particle_aa_createSessions',
        params: [
          // account config
          account,
          // create sessions
          session            
        ],
      }, {
          auth: {
              username: projectId,
              password: projectServerKey,
          },
      });

      // console.log(response.data.result);
      // console.log("sessions: " + JSON.stringify(response.data.result.sessions));
      // console.log("transactions: " + JSON.stringify(response.data.result.transactions));
      // console.log("verifyingPaymasterNative: " + JSON.stringify(response.data.result.verifyingPaymasterNative.userOp));
      return response.data
    } catch (error) {
      const errorMsg = `Error while call from particle! ${error}`;
      throw new Error(errorMsg);
    }
  }  

}
