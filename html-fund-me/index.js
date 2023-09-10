//将整个etherjs库放到本地然后导入
import { ethers } from "./ether-E56.js";
import { ABI, ContractAddress } from "./constant.js";

const connectButton = document.getElementById("connectButton");
const fundButton = document.getElementById("fundButton");
const balanceButton = document.getElementById("balanceButton");
const withdrawButton = document.getElementById("withdrawButton");
connectButton.onclick = connect;
fundButton.onclick = fund;
balanceButton.onclick = getBalance;
withdrawButton.onclick = Withdraw;

async function connect() {
  // if (connectButton.innerHTML == "Connected") {
  //   alert("you have connected it");
  // }
  //检查是否有matemask
  if (typeof window.ethereum !== undefined) {
    console.log("matemask is here!");
    //连接matemask
    await window.ethereum.request({ method: "eth_requestAccounts" });
    connectButton.innerHTML = "Connected";
  } else {
    alert("Please install matemask");
  }
}

async function fund() {
  const ethAmount = document.getElementById("ethAmount").value;
  console.log(`you spend ${ethAmount}`);
  if (typeof window.ethereum !== undefined) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(ContractAddress, ABI, signer);
    try {
      const transactionResponse = await contract.fund({
        value: ethers.utils.parseEther(ethAmount),
      });
      //wait for this transaction to finish
      await listenForTransactionMine(transactionResponse, provider);
      console.log("Done");
    } catch (error) {
      console.log(error);
    }
  }
}

async function getBalance() {
  if (typeof window.ethereum != "undefined") {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const balance = await provider.getBalance(ContractAddress);
    console.log(ethers.utils.formatEther(balance));
  }
}

function listenForTransactionMine(transactionResponse, provider) {
  console.log(`Mining ${transactionResponse.hash}...`);
  return new Promise((resolve, reject) => {
    provider.once(transactionResponse.hash, (transactionReceipt) => {
      console.log(
        `Compeleted with ${transactionReceipt.confirmation}confirmations.`
      );
      resolve();
    });
  });
}

async function Withdraw() {
  if (typeof window.ethereum != "undefined") {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(ContractAddress, ABI, signer);
    try {
      //在这里调用
      const transactionResponse = await contract.cheaperWithdraw();
      await listenForTransactionMine(transactionResponse, provider);
    } catch (error) {
      console.log(error);
    }
  }
}
