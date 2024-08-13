import { Queue } from 'bull';
import { IpassetService } from '../ipasset/ipasset.service';
import { InjectQueue } from '@nestjs/bull';
import { BadRequestException, ForbiddenException, Injectable, Logger } from '@nestjs/common';
import { ENV_CONFIG } from '../../shared/services/config.service';
import { BedrockAgentRuntimeClient, InvokeAgentCommand } from '@aws-sdk/client-bedrock-agent-runtime';
import { parse } from 'path';

@Injectable()
export class BedrockAgentService {
  private readonly _logger = new Logger(BedrockAgentService.name);
  private _bedrockClient: BedrockAgentRuntimeClient;
  private _agentId: string = ENV_CONFIG.BEDROCK.AGENTID;
  private _agentAliasId: string = ENV_CONFIG.BEDROCK.AGENTALIASID;

  constructor() // private ipassetService: IpassetService // private redisClientService: RedisService,
  {
    this._bedrockClient = new BedrockAgentRuntimeClient({
      region: ENV_CONFIG.BEDROCK.REGION,
      credentials: {
        accessKeyId: ENV_CONFIG.BEDROCK.ACCESSKEY, // permission to invoke agent
        secretAccessKey: ENV_CONFIG.BEDROCK.SECRET,
      },
    });
  }

  async sendAskingText(prompt: string, sessionId: string, endSession: boolean) {
    try {
      let agentRes = await this.invokeBedrockAgent(prompt, sessionId, endSession);
      return agentRes;
    } catch (errors) {
      return {
        errors,
      };
    }
  }

  /**
   * @typedef {Object} ResponseBody
   * @property {string} completion
   */

  /**
   * Invokes a Bedrock agent to run an inference using the input
   * provided in the request body.
   *
   * @param {string} prompt - The prompt that you want the Agent to complete.
   * @param {string} sessionId - An arbitrary identifier for the session.
   */
  async invokeBedrockAgent(prompt: string, sessionId: string, endSession: boolean) {
    const agentId = this._agentId;
    const agentAliasId = this._agentAliasId;
    const command = new InvokeAgentCommand({
      agentId,
      agentAliasId,
      sessionId,
      inputText: prompt,
      endSession: endSession,
    });

    try {
      let completion = '';
      const response = await this._bedrockClient.send(command);

      if (response.completion === undefined) {
        throw new Error('Completion is undefined');
      }

      for await (let chunkEvent of response.completion) {
        const chunk = chunkEvent.chunk;
        const decodedResponse = new TextDecoder('utf-8').decode(chunk.bytes);
        completion += decodedResponse;
      }

      // const re = /<script\b[^>]*>[\s\S]*?<\/script\b[^>]*>/g
      // const actions = completion.match(re)
      // this._logger.log(`[actions]: ` + actions);

      // if(actions){
      //   const actionsObj = JSON.parse(actions.toString().replace(/<script>|<\/script>/g, ''))
      //   if(actionsObj.type == "CREATE_IP_ASSET"){
      //     completion = await this.registerIpasset(actionsObj.nftContract, actionsObj.tokenId)
      //   }else if(actionsObj.type == "MINT_LICENSE"){
      //     completion = await this.mintLicenseToken(actionsObj.nftContract, actionsObj.tokenId)
      //   }
      // }
      return { sessionId: sessionId, completion };
    } catch (err) {
      console.error(err);
      return err;
    }
  }

  // async registerIpasset (nftAddr, tokenId) {
  //   try {
  //     const res = await this.ipassetService.registerIpasset(nftAddr, tokenId);
  //     return res;
  //   } catch (error) {
  //     return "Register fail: " + error
  //   }
  // };

  // async mintLicenseToken (nftAddr, tokenId) {
  //   try {
  //     const res = await this.ipassetService.registerIpasset(nftAddr, tokenId);
  //     return res;
  //   } catch (error) {
  //     return "Register fail: " + error
  //   }
  // };
}
