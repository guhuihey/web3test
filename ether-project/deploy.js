const ethers = require("ethers");

const fs = require("fs-extra");
require("dotenv").config();

async function main() {
  //http://127.0.0.1:7545
  const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
  const encryptedJson = fs.readFileSync("./encryptedkey.json", "utf8");
  let wallet = new ethers.Wallet.fromEncryptedJsonSync(
    encryptedJson,
    process.env.PRIVATE_KEY_PASSWORD
  );
  wallet = await wallet.connect(provider);
  const abi = fs.readFileSync("./SimpleStorage_sol_SimpleStorage.abi", "utf8");
  const binary = fs.readFileSync(
    "./SimpleStorage_sol_SimpleStorage.bin",
    "utf8"
  );

  const contractFactory = new ethers.ContractFactory(abi, binary, wallet);

  console.log("Deploying,please wait...");

  const contract = await contractFactory.deploy(); //stop here to deploy
  await contract.deployTransaction.wait(1);
  console.log(`Contract Address: ${contract.address}`);
  //Get number
  const currentFavorateNumber = await contract.retreive();
  console.log(`Current Favorate Number: ${currentFavorateNumber.toString()}`); //这两行代码吗
  const transactionResponse = await contract.store("8");
  const transactionReceipt = await transactionResponse.wait(1);
  const updatedFavorateNumber = await contract.retreive();
  console.log(`Updated favorate number is: ${updatedFavorateNumber}`);
}

main()
  .then(() => process.exit(0))

  .catch((error) => {
    console.error(error);

    process.exit();
  });
