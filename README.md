# Decentralized Programmable Intellectual Property (Depip)

Depip agent is an AI agent who can help you answer questions about Programable IP License from [Story Protocol](https://docs.storyprotocol.xyz/docs/what-is-story-protocol), help you create an IP license, register NFT as IP... with no coding. Just ask the agent.

## Overview architecture
This backend has 2 part: api and sync service. API is connected to AWS bedrock agent service, and sync currently sync IP asset from Story Protocol on Sepolia testnet.

```mermaid
flowchart LR

subgraph "Backend"
    subgraph "Agent"
        chat-model[chat-model]
        lambda-function[lambda-function]
        chat-model --> lambda-function
    end
    subgraph "Knowledge base"
        direction TB
        s3[s3]
        embedding-model[embedding-model]
        vector-database[vector-database]
        s3 --> embedding-model --> vector-database
    end  
    subgraph "sync-service"
        database[database]
    end
    
    subgraph "Blockchain"
        IP[ip]
        licensing[licensing]
        royalty[royalty]
        dispute[dispute]
    end
end

subgraph "User"
    terminal-frontend[terminal]
end

chat-model --> vector-database
chat-model --> database
Blockchain --> sync-service
terminal-frontend --> Backend

```
## Currently status
This repository is under development. You can try swagger on the link https://dev.depip.studio/documentation
## Deployment
```
yarn install
cp .env.sample .env
yarn start:dev
```
