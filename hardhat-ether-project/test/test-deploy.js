const { assert, expect } = require("chai");
const { ethers } = require("hardhat");

//describe("SimpleStorage",()=>{})
describe("SimpleStorage", function () {
  let simpleStorageFactory, simpleStorage;
  beforeEach(async function () {
    console.log("testing");
    //simpleStorageFactory=await ehters.getContractFactory("SimpleStorage")
    //simpleStorage=await simpleStorageFactory.deploy()
    simpleStorage = await ethers.deployContract("SimpleStorage");
    await simpleStorage.waitForDeployment();
  });
  it("Should start with a favorite number of 0", async function () {
    const currentValue = await simpleStorage.retrieve();
    const expectedValue = "0";
    assert.equal(currentValue.toString(), expectedValue);
    // expect(currentValue.toSring()).to.equal(expectedValue);效果与上面的断言等同
  });
  // it.only可以仅测试这个it中的代码
  it.only("Should update when we call store", async function () {
    const expectedValue = "7";
    const transactionResponse = await simpleStorage.store(expectedValue);
    await transactionResponse.wait(1);
    const currentValue = await simpleStorage.retrieve();
    assert.equal(currentValue.toString(), expectedValue);
  });
});
