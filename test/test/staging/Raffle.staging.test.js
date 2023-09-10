const { assert, expect } = require("chai");
const { getNamedAccounts, ethers, network } = require("hardhat");
const { developmentChains } = require("../../helper-hardhat-config");
const {
  isCallTrace,
} = require("hardhat/internal/hardhat-network/stack-traces/message-trace");

developmentChains.includes(network.name)
  ? describe.skip
  : describe("Raffle Staging Tests", function () {
      let raffle, raffleEntranceFee, deployer;
      beforeEach(async function () {
        deployer = (await getNamedAccounts()).deployer;
        raffle = await ethers.getContract("Raffle ", deployer);
        raffleEntranceFee = await raffle.getEntranceFee();
      });
      describe("fulfillRandomWords", function () {
        it("works with live Chainlink Keeper and Chainlink VRF,we get a random winner", async function () {
          console.log("Setting up test...");
          const startingTimeStamp = await raffle.getLastTimeStamp();
          const accounts = await ethers.getSigners();
          console.log("Setting up Listener");

          await new Promise(async function (resolve, reject) {
            raffle.once("WinnerPicked", async function () {
              console.log("WinnerPicked event fried!");
              try {
                const recentWinner = await raffle.getRecentWinner();
                const raffleState = await raffle.getRaffleState();
                const winnerEndingBalance = await accounts[0].getBalance();
                const endingTimeStamp = await raffle.getLastTimeStamp();
                await expect(raffle.getPlayer(0)).to.be.reverted;
                assert.equal(recentWinner.toString(), accounts[0].address);
                assert.equal(raffleState, 0);
                assert.equal(
                  winnerEndingBalance.toString(),
                  (winnerStartingBalance + raffleEntranceFee).toString()
                );
                assert(endingTimeStamp > startingTimeStamp);
                resolve();
              } catch (e) {
                console.log(e);
                reject(e);
              }
            });
            console.log("Entering Raffle...");
            const tx = await raffle.enterRaffle({ value: raffleEntranceFee });
            await tx.wait(1);
            console.log("Ok,time to wait...");
            const winnerStartingBalance = await accounts[0].getBalance();
          });
        });
      });
    });
