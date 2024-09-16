import dotenv from 'dotenv';
import {Address} from "./types";

dotenv.config();

export interface Config {
  rpcUrl: string,
  bridgeAddress: Address,
  tokenAddress: Address,
  destinationChainId: number,
  bridgeFee: number,
  tokenAmount: number,
}

export const config: Config = {
  rpcUrl: process.env.RPC_URL || '',
  bridgeAddress: "0x90Ed8F1dc86388f14b64ba8fb4bbd23099f18240",
  tokenAddress: "0x623cd3a3edf080057892aaf8d773bbb7a5c9b6e9",
  bridgeFee: 0.001,
  tokenAmount: 10,
  destinationChainId: 101,
};

if (!config.rpcUrl) {
  throw new Error('Missing required environment variable: RPC_URL');
}

