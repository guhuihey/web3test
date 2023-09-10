// imports
const { ethers, run, network } = require("hardhat");

// async main
async function main() {
  // const SimpleStorageFactory = await ethers.getContractFactory("SimpleStorage");
  console.log("Deploying contract...");
  const simpleStorage = await ethers.deployContract("SimpleStorage");
  await simpleStorage.waitForDeployment();
  console.log(`Deployed contract to: ${await simpleStorage.getAddress()}`);
  //部署到公链上就进行验证
  if (
    network.config === process.env.SEPOLIA_CHAIN_ID &&
    process.env.ETHERSCAN_API_KEY
  ) {
    //等待挖出六个区块后再进行验证
    await simpleStorage.deployTransaction.wait(6);
    await verify(await simpleStorage.getAddress(), []);
  }
  const Value = await simpleStorage.retrieve();
  console.log(`The value is ${Value}`);
  const transactionResponse = await simpleStorage.store(7);
  //等待一个区块
  await transactionResponse.wait();
  const updatedValue = await simpleStorage.retrieve();
  console.log(`Updated Value is: ${updatedValue}`);
}
// 验证合约
async function verify(contractAddress, args) {
  console.log("Verifying contract...");
  try {
    await run("verify:verify", {
      address: contractAddress,
      constructorArgument: args,
    });
  } catch (e) {
    if (e.message.toLowerCase().include("already verified")) {
      console.log("Already Verified!");
    } else {
      console.log(e);
    }
  }
}
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
