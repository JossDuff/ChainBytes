const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ElSalvadorCoffee", function () {
  it("Should return the new greeting once it's changed", async function () {
    const ElSalvadorCoffee = await ethers.getContractFactory("ElSalvadorCoffee");
    const elSalvadorCoffee = await ElSalvadorCoffee.deploy("Hello, world!");
    await elSalvadorCoffee.deployed();

    expect(await elSalvadorCoffee.greet()).to.equal("Hello, world!");

    //const setGreetingTx = await elSalvadorCoffee.setGreeting("Hola, mundo!");

    // wait until the transaction is mined
    //await setGreetingTx.wait();

    //expect(await elSalvadorCoffee.greet()).to.equal("Hola, mundo!");

    // write assertions to test
  });
});
