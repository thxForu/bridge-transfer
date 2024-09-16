import {ethers, JsonRpcProvider} from 'ethers';
import {Config, config} from "./config";
import {bridgeAbi, erc20Abi} from "./abi";
import {BridgeTxRequest} from "./types";


function initProvider(config: Config): ethers.JsonRpcProvider {
  if (!config.rpcUrl) {
    throw new Error('Missing required environment variables.');
  }

  return new ethers.JsonRpcProvider(config.rpcUrl);
}

async function checkBalance(tokenContract: ethers.Contract, address: string, amount: string): Promise<bigint> {
  const balance = await tokenContract.balanceOf(address);
  const parsedAmount = ethers.parseEther(amount);
  if (balance < parsedAmount) {
    throw new Error('Insufficient balance');
  }

  return parsedAmount;
}

async function approveTokens(tokenContract: ethers.Contract, spender: string, amount: string): Promise<void> {
  console.log('Approving tokens...');
  const approveTx = await tokenContract.approve(spender, amount);
  await approveTx.wait();
  console.log('Tokens approved');
}

async function bridgeTokens(bridgeTxData: BridgeTxRequest, signer: ethers.Wallet) {
  try {
    const {
      fromAddress,
      destinationChainId,
      tokenAddress,
      tokenAmount,
      bridgeAddress,
      bridgeFee,
    } = bridgeTxData;

    const tokenContract = new ethers.Contract(tokenAddress, erc20Abi, signer);
    const bridgeContract = new ethers.Contract(bridgeAddress, bridgeAbi, signer);

    const parsedTokenAmount = await checkBalance(tokenContract, signer.address, tokenAmount.toString());

    const minAmount = ethers.parseEther((tokenAmount * (1 - bridgeFee)).toString());

    await approveTokens(tokenContract, config.bridgeAddress, parsedTokenAmount.toString());

    const toAddressBytes32 = ethers.zeroPadValue(fromAddress, 32);
    const callParams = {
      refundAddress: fromAddress,
      zroPaymentAddress: ethers.ZeroAddress,
      adapterParams: "0x"
    };

    const [nativeFee] = await bridgeContract.estimateSendFee(destinationChainId, toAddressBytes32, parsedTokenAmount, false, "0x");

    console.log('Bridging tokens...');
    const bridgeTx = await bridgeContract.sendFrom(
      fromAddress,
      destinationChainId,
      toAddressBytes32,
      parsedTokenAmount,
      minAmount,
      callParams,
      {
        gasLimit: 300000,
        value: nativeFee
      }
    );

    const receipt = await bridgeTx.wait();
    console.log(`Bridge transaction completed. Hash: ${receipt.hash}`);
  } catch (err) {
    console.error(`Could not perform token bridge: ${err}`);
  }

}

function prepareBridgeTxData(signer: ethers.Wallet): BridgeTxRequest {
  return {
    fromAddress: signer.address,
    destinationChainId: config.destinationChainId,
    tokenAddress: config.tokenAddress,
    tokenAmount: config.tokenAmount,
    bridgeAddress: config.bridgeAddress,
    bridgeFee: config.bridgeFee
  };
}

async function main() {
  const provider: JsonRpcProvider = initProvider(config);
  const privateKey = process.env.PRIVATE_KEY as string;
  const signer = new ethers.Wallet(privateKey, provider);

  const bridgeTxData = prepareBridgeTxData(signer);
  await bridgeTokens(bridgeTxData, signer);
}

main();
