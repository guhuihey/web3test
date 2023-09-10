//导入对应的库
const { task } = require("hardhat/config");

task("block-number", "prints the current block number").setAction(
  //异步函数的两种定义方式
  //const bolckTask= async function()=>{}
  //asybc function blockTask(){}
  async (taskArgs, hre) => {
    const blockNumber = await hre.ethers.provider.getBlockNumber();
    console.log(`Current block number: ${blockNumber}`);
  }
);
module.exports = {};
