import { Queue } from 'bull';
import { SiweMessage } from 'siwe';

import { InjectQueue } from '@nestjs/bull';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { ENV_CONFIG } from '../../shared/services/config.service';
import {
  BedrockAgentRuntimeClient,
  InvokeAgentCommand,
} from "@aws-sdk/client-bedrock-agent-runtime";



@Injectable()
export class BedrockAgentService {
  private readonly logger = new Logger(BedrockAgentService.name);
  constructor(
    // private checkConditionService: CheckConditionService,
    // private redisClientService: RedisService,

  ) {}

  async sendAskingText(prompt: string, sessionId: string) {
    try {
      let agentRes = await this.invokeBedrockAgent(prompt, sessionId);
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
  async invokeBedrockAgent (prompt, sessionId) {
    // const client = new BedrockAgentRuntimeClient({ region: "ap-southeast-2" });
    const client = new BedrockAgentRuntimeClient({
      region: ENV_CONFIG.BEDROCK.REGION,
      credentials: {
        accessKeyId: ENV_CONFIG.BEDROCK.ACCESSKEY, // permission to invoke agent
        secretAccessKey: ENV_CONFIG.BEDROCK.SECRET,
      },
    });

    const agentId = ENV_CONFIG.BEDROCK.AGENTID;
    const agentAliasId = ENV_CONFIG.BEDROCK.AGENTALIASID;

    const command = new InvokeAgentCommand({
      agentId,
      agentAliasId,
      sessionId,
      inputText: prompt,
    });

    try {
      let completion = "";
      const response = await client.send(command);

      if (response.completion === undefined) {
        throw new Error("Completion is undefined");
      }

      for await (let chunkEvent of response.completion) {
        const chunk = chunkEvent.chunk;
        const decodedResponse = new TextDecoder("utf-8").decode(chunk.bytes);
        completion += decodedResponse;
      }

      return { sessionId: sessionId, completion };
    } catch (err) {
      console.error(err);
    }
  };

}


