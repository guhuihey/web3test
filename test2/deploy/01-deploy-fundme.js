// async function deployFunc(hre){
// hre.getNamedAccounts()
// hre.deployments

// }
// module.exports.default=deployFunc
//上面的module.exports和下面的写法作用相同
// module.exports=async(hre)=>{
//     const{getNamedAccount,deployments}=hre;
// }

//const helperConfig=require("../helper-hardhat-config")
//const networkConfig=helperConfig.networkConfig
const {
  networkConfig,
  developmentChains,
} = require("../helper-hardhat-config");
const { network } = require("hardhat");
const { verify } = require("../utils/verify");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId;

  let ethUsdPriceFeedAddress;
  if (developmentChains.includes(network.name)) {
    const ethUsdAggregator = await deployments.get("MockV3Aggregator");
    ethUsdPriceFeedAddress = ethUsdAggregator.address;
    console.log(ethUsdPriceFeedAddress);
  } else {
    ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"];
  }
  const args = [ethUsdPriceFeedAddress];

  const fundMe = await deploy("Fundme", {
    from: deployer,
    args: args,
    log: true,
    waitConfirmations: network.config.blockConfirmations || 1,
  });
  console.log("fundme deployed");
  if (
    !developmentChains.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    //verify
    await verify(fundMe.address, args);
    // console.log(fundMe);
  }
  log("----------------------------------------------------");

  // const ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPricceFeed"];
};
module.exports.tags = ["all", "fundme"];
