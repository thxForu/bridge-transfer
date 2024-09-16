export const erc20Abi = [
  'function approve(address spender, uint256 amount) public returns (bool)',
  'function balanceOf(address account) public view returns (uint256)',
];

export const bridgeAbi = [
  'function sendFrom(address _from, uint16 _dstChainId, bytes32 _toAddress, uint256 _amount, uint256 _minAmount, tuple(address refundAddress, address zroPaymentAddress, bytes adapterParams) _callParams) public payable',
  'function estimateSendFee(uint16 _dstChainId, bytes32 _toAddress, uint256 _amount, bool _useZro, bytes _adapterParams) public view returns (uint256 nativeFee, uint256 zroFee)',
];
