export type Address = string;
export type TokenAmount = number;

export interface BridgeTxRequest {
  fromAddress: Address,
  tokenAddress: Address,
  tokenAmount: TokenAmount,
  destinationChainId: number,
  bridgeAddress: Address,
  bridgeFee: number,
}
