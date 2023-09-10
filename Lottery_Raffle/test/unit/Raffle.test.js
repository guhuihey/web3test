const { getNamedAccounts, deployments, ethers, network } = require("hardhat");
const {
  developmentChains,
  networkConfig,
} = require("../../helper-hardhat-config");
const {
  isCallTrace,
} = require("hardhat/internal/hardhat-network/stack-traces/message-trace");
const { assert, expect } = require("chai");

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("Raffle Unit Tests", function () {
      let deployers, raffleState, interval;
      let deployer, player, raffleEntranceFee;
      let raffle, vrfCoordinatorV2Mock;
      const chainId = network.config.chainId;
      beforeEach(async function () {
        //不知道getSigners怎么使用还是使用getNamedAccounts替代，似乎可以使用provider.getSigner()
        deployers = await getNamedAccounts();
        deployer = deployers.deployer;
        player = deployers.player;
        await deployments.fixture(["all"]);
        raffle = await ethers.getContract("Raffle", deployer);
        consumerRaffle = await ethers.getContract("Raffle", player);
        // raffleContract = await ethers.getContract("Raffle", deployer);
        // raffle = await raffleContract.connect(player);
        vrfCoordinatorV2Mock = await ethers.getContract(
          "VRFCoordinatorV2Mock",
          deployer
        );
        raffleEntranceFee = await raffle.getEntranceFee();
        raffleState = await consumerRaffle.getRaffleState();
        interval = await consumerRaffle.getInterval();
      });
      describe("constractor", function () {
        it("Initlalizes the raffle correctly", async function () {
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
          assert.equal(player.address, contractPlayer);
        });
        it("emits event on enter", async function () {
          await expect(
            raffle
              .enterRaffle({ value: raffleEntranceFee })
              .to.emit(raffle, "RaffleEnter")
          );
        });
        it("doesn't allow entrance when raffle is calculating", async function () {
          await raffle.enterRaffle({ value: raffleEntranceFee });
          await network.provider.send("evm_increaseTime", [
            interval.toNumber() + 1,
          ]);
          await network.provider.request({ method: "evm_mine", params: [] });
          await raffle.performUpkeep([]);
          await expect(
            raffle.enterRaffle({ value: raffleEntranceFee })
          ).to.be.reverted("Raffle__RaffleNotOpen");
        });
      });
      describe("checkUpkeep", function () {
        it("return false if people haven't sent any ETH", async function () {
          await network.provider.send("evm_increseTime", [
            interval.toNumber() + 1,
          ]);
          await network.provider.request({ method: "evm_mine", params: [] });
          const { upkeepNeeded } = await raffle.callStatic.checkUpkeep("0x");
          assert(!upkeepNeeded);
        });
      });
    });
