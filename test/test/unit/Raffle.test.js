const { getNamedAccounts, deployments, ethers, network } = require("hardhat");
const {
  developmentChains,
  networkConfig,
} = require("../../helper-hardhat-config");
const {
  isCallTrace,
} = require("hardhat/internal/hardhat-network/stack-traces/message-trace");
const { assert, expect } = require("chai");
const {
  experimentalAddHardhatNetworkMessageTraceHook,
} = require("hardhat/config");
const {
  HARDHAT_NETWORK_SUPPORTED_HARDFORKS,
} = require("hardhat/internal/constants");
const { TransactionResponse } = require("ethers");

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("Raffle Unit Tests", function () {
      let deployers, raffleState, interval, accounts;
      let deployer, player, raffleEntranceFee;
      let raffle, vrfCoordinatorV2Mock;
      const chainId = network.config.chainId;
      beforeEach(async function () {
        accounts = await ethers.getSigners();
        //不知道getSigners怎么使用还是使用getNamedAccounts替代，似乎可以使用provider.getSigner()
        deployers = await getNamedAccounts();
        deployer = deployers.deployer;
        player = deployers.player;
        await deployments.fixture(["all"]);
        // raffle = await ethers.getContract("Raffle", deployer);
        raffle = await ethers.getContract("Raffle", player);
        raffleContract = await ethers.getContract("Raffle", deployer);
        // raffle = await raffleContract.connect(player);
        vrfCoordinatorV2Mock = await ethers.getContract(
          "VRFCoordinatorV2Mock",
          deployer
        );

        raffleEntranceFee = await raffle.getEntranceFee();
        raffleState = await raffle.getRaffleState();
        interval = await raffle.getInterval();
      });
      // describe("onlyOwner", function () {
      //   it("must be owner", async function () {
      //     await consumerRaffle.enterRaffle({ value: raffleEntranceFee });
      //     await expect(
      //       consumerRaffle.getPlayer(0)
      //     ).to.be.revertedWithCustomError(consumerRaffle, "Raffle__NotOwner");
      //     // await expect(raffle.getPlayer(0)).to.be.revertedWithCustomError(
      //     //   raffle,
      //     //   "Raffle__NotOwner"
      //     // );
      //     const contractPlayer = await raffleContract.getPlayer(0);
      //     assert.equal(player, contractPlayer);
      //     // await expect(
      //     //   raffleContract.getPlayer(0)
      //     // ).to.be.revertedWithCustomError(raffleContract, "Raffle__NotOwner");
      //   });
      // });
      describe("constractor", function () {
        it("Initlalizes the raffle correctly", async function () {
          // let balance = await ethers.provider.getBalance(accounts[2]);
          // console.log(balance);
          assert.equal(raffleState.toString(), "0");
          assert.equal(
            interval.toString(),
            networkConfig[chainId]["keepersUpdateInterval"]
          );
        });
      });
      describe("enterRaffle", function () {
        it("revert when you don't pay enough", async function () {
          await expect(raffle.enterRaffle()).to.be.revertedWithCustomError(
            raffle,
            "Raffle__SendMoreToEnterRaffle"
          );
        });
        it("records player when they enter", async function () {
          await raffle.enterRaffle({ value: raffleEntranceFee });
          const contractPlayer = await raffle.getPlayer(0);
          assert.equal(player, contractPlayer);
        });
        it("emits event on enter", async function () {
          expect(
            await raffle.enterRaffle({ value: raffleEntranceFee })
          ).to.emit(raffle, "RaffleEnter");
        });
        it("doesn't allow entrance when raffle is calculating", async function () {
          // await raffle.performUpkeep("0x");
          await raffle.enterRaffle({ value: raffleEntranceFee });
          await network.provider.send("evm_increaseTime", [
            Number(interval) + 1,
          ]);
          // console.log(typeof interval);
          await network.provider.request({ method: "evm_mine", params: [] });
          // console.log(typeof interval);
          // console.log(interval);
          await raffle.performUpkeep("0x");

          await expect(
            raffle.enterRaffle({ value: raffleEntranceFee })
          ).to.be.revertedWithCustomError(raffle, "Raffle__RaffleNotOpen");
        });
      });
      describe("checkUpkeep", function () {
        it("return false if people haven't sent any ETH", async function () {
          await network.provider.send("evm_increaseTime", [
            Number(interval) + 1,
          ]);
          await network.provider.request({ method: "evm_mine", params: [] });
          // const { upkeepNeeded } = await raffle.callStatic.checkUpkeep([]);
          const { upkeepNeeded } = await raffle.checkUpkeep.staticCall("0x");
          assert(!upkeepNeeded);
        });
        it("return false if raffle isn't open", async function () {
          await raffle.enterRaffle({ value: raffleEntranceFee });
          await network.provider.send("evm_increaseTime", [
            Number(interval) + 1,
          ]);
          await network.provider.request({ method: "evm_mine", params: [] });
          await raffle.performUpkeep("0x");
          const raffleState = await raffle.getRaffleState();
          const { upkeepNeeded } = await raffle.checkUpkeep.staticCall("0x");
          assert.equal(raffleState.toString() == "1", upkeepNeeded == false);
        });
        it("return true if enough time has passed, has players,eth,and is open", async function () {
          await raffle.enterRaffle({ value: raffleEntranceFee });
          await network.provider.send("evm_increaseTime", [
            Number(interval) + 1,
          ]);
          await network.provider.request({ method: "evm_mine", params: [] });
          const { upkeepNeeded } = await raffle.checkUpkeep.staticCall("0x");
          assert(upkeepNeeded);
        });
      });
      describe("performUpkeep", function () {
        it("can only run if checkupkeep is true", async function () {
          await raffle.enterRaffle({ value: raffleEntranceFee });
          await network.provider.send("evm_increaseTime", [
            Number(interval) + 1,
          ]);
          await network.provider.request({ method: "evm_mine", params: [] });
          const tx = await raffle.performUpkeep("0x");
          assert(tx);
        });
        it("reverts if check is false", async function () {
          await expect(
            raffle.performUpkeep("0x")
          ).to.be.revertedWithCustomError(raffle, "Raffle__UpkeepNotNeeded");
        });

        it("updates the raffle state and emits a requestId", async function () {
          await raffle.enterRaffle({ value: raffleEntranceFee });
          await network.provider.send("evm_increaseTime", [
            Number(interval) + 1,
          ]);
          await network.provider.request({ method: "evm_mine", params: [] });
          const txResponse = await raffle.performUpkeep("0x");
          const txReceipt = await txResponse.wait();
          const raffleState = await raffle.getRaffleState();
          // const requestId = txReceipt.events[1].args.requestId
          const requestId = txReceipt.logs[1].args[0];
          assert(Number(requestId) > 0);
          assert(raffleState == 1);
        });
      });
      describe("fulfillRandomWords", function () {
        beforeEach(async function () {
          await raffle.enterRaffle({
            value: raffleEntranceFee,
          });
          await network.provider.send("evm_increaseTime", [
            Number(interval) + 1,
          ]);
          await network.provider.request({ method: "evm_mine", params: [] });
        });
        it("can only be called after performupkeep", async function () {
          await expect(
            //   vrfCoordinatorV2Mock.fulfillRandomWords(0, raffle.address)
            // ).to.be.revertedWith("nonexistent request");
            vrfCoordinatorV2Mock.fulfillRandomWords(0, raffle.target)
          ).to.be.revertedWith("nonexistent request");
          await expect(
            vrfCoordinatorV2Mock.fulfillRandomWords(1, raffle.target)
          ).to.be.revertedWith("nonexistent request");
        });
        it("picks a winner,resets,and sends money", async function () {
          const additionalEntrances = 3;
          const startingIndex = 2;
          let startingBalance;
          let transactionResponse;
          for (
            let i = startingIndex;
            i < startingIndex + additionalEntrances;
            i++
          ) {
            // raffle = raffleContract.connect(accounts[i]);
            raffle = await ethers.getContract("Raffle", accounts[i]);
            transactionResponse = await raffle.enterRaffle({
              value: raffleEntranceFee,
            });
          }
          transactionReceipt = await transactionResponse.wait();
          const { gasUsed, gasPrice } = transactionReceipt;
          const gasCost = gasPrice * gasUsed;
          const startingTimeStamp = await raffle.getLastTimeStamp();
          await new Promise(async (resolve, reject) => {
            raffle.once("WinnerPicked", async function () {
              console.log("WinnerPicked event fired!");
              try {
                const recentWinner = await raffle.getRecentWinner();
                // console.log(recentWinner);
                const raffleState = await raffle.getRaffleState();
                const winnerBalance = await ethers.provider.getBalance(
                  accounts[2]
                );

                const endingTimeStamp = await raffle.getLastTimeStamp();
                await expect(raffle.getPlayer(0)).to.be.reverted;
                assert.equal(recentWinner.toString(), accounts[2].address);
                assert.equal(raffleState, 0);
                // console.log(ethers.provider.getBalance(player));
                console.log("This is test1");
                await assert.equal(
                  winnerBalance.toString(),
                  (
                    startingBalance +
                    raffleEntranceFee * BigInt(additionalEntrances) +
                    raffleEntranceFee
                  ).toString()
                );
                assert(endingTimeStamp > startingTimeStamp);
                resolve();
              } catch (e) {
                reject(e);
              }
            });
            //这个try中的内容将会先于raffle.once执行，可能是因为reject解析放在了这里
            try {
              const tx = await raffle.performUpkeep("0x");
              const txReceipt = await tx.wait();
              console.log("This is test2");
              startingBalance = await ethers.provider.getBalance(accounts[2]);
              await vrfCoordinatorV2Mock.fulfillRandomWords(
                txReceipt.logs[1].args.requestId,
                raffle.target
              );
            } catch (e) {
              reject(e);
            }
          });
        });
      });
    });
