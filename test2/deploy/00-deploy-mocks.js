const { network } = require("hardhat");
const {
  developmentChains,
  DECIMALS,
  INITIAL_ANSWER,
} = require("../helper-hardhat-config");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId;

  if (developmentChains.includes(network.name)) {
    log("Local network detected! Deploying mocks..");
    await deploy("MockV3Aggregator", {
      contract: "MockV3Aggregator",
      from: deployer,
      log: true,
      /*下面是传入MockV3Aggregator中的构造参数*/
      args: [DECIMALS, INITIAL_ANSWER],
    });
    log("Mocks deployed!");
    console.log("-------------------------------------------");
  }
};

module.exports.tags = ["all", "mocks"];
