const { ethers } = require("hardhat");

const networkConfig = {
  default: {
    name: "hardhat",
    keepersUpdateInterval: "30",
  },
  31337: {
    name: "localhost",
    subscriptionId: "588",
    gasLane:
      "0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c",
    keepersUpdateInterval: "30",
    raffleEntranceFee: ethers.parseEther("0.01"),
    callbackGasLimit: "500000",
  },
  11155111: {
    keepersUpdateInterval: "30",
    name: "sepolia",
    subscriptionId: "4496",
    gasLane:
      "0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c",
    keepersUpdateInter: "30",
    raffleEntranceFee: ethers.parseEther("0.01"),
    callbackGasLimit: "500000",
    vrfCoordinatorV2: "0x8103B0A8A00be2DDC778e6e7eaa21791Cd364625",
  },
  1: {
    name: "mainnet",
    keepersUpdateInterval: "30",
  },
};
const developmentChains = ["hardhat", "localhost"];
const VERIFICATION_BLOCK_CONFIRMATIONS = 6;
const frontEndContractsFile =
  "../nextjs-smartcontract-lottery-fcc/constants/contracts/contractAddress.json";
const frontEndAbiFile =
  "../nextjs-smartcontract-lottery-fcc/constants/abi.json";

module.exports = {
  networkConfig,
  developmentChains,
  VERIFICATION_BLOCK_CONFIRMATIONS,
  frontEndContractsFile,
  frontEndAbiFile,
};
