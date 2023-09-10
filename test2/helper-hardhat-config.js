const networkConfig = {
  11155111: {
    name: "sepolia",
    ethUsdPriceFeed: "0x694AA1769357215DE4FAC081bf1f309aDC325306",
  },
};
const developmentChains = ["hardhat", "localhost"];
//传递给mock的参数用来初始化feedprice
const DECIMALS = 8;
const INITIAL_ANSWER = 200000000000;
module.exports = {
  networkConfig,
  developmentChains,
  DECIMALS,
  INITIAL_ANSWER,
};
