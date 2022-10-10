const { expect, use } = require("chai");
const { ethers } = require("hardhat");

const provider = ethers.getDefaultProvider();
describe("coffee contract", function () {
  //these vars will hold Signers from ethers
  //Signers are ethers objects that are similar to accounts in Ethereum
  // they have different attributes like: balance, address
  //can be used to call contract functions
  let owner;
  let addr1;
  let addr2;
  let addr3;

  beforeEach(async function () {
    coffee = await ethers.getContractFactory("coffee");
    //the first return from getSigners() is defaulted as the owner of the contract
    [owner, addr1, addr2, addr3] = await ethers.getSigners();

    // Deploys contract
    //hardhatCoffee is the contract object that is used to call functions
    hardhatCoffee = await coffee.deploy();
  });
  //
  //test to verify the owner is being properly set after deployment
  //
  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await hardhatCoffee.owner()).to.equal(owner.address);
    });
  });
  //
  //calls create farm passing in address1 and then checks the address using the mapping isFarm
  //
  describe("Farm creation", function () {
    it("Should assign an address as a farm", async function () {
      await hardhatCoffee.createFarm(addr1.address);
      const isFarm = await hardhatCoffee.isFarm(addr1.address);

      expect(isFarm).to.equal(true);
    });
  });
  //
  //Creates farm, assigns address2 to a foreman and then checks this worked calling isForeman
  describe("Foreman creation", function () {
    it("Should assign an address as a foreman", async function () {
      // Sets addr1 as a farm
      await hardhatCoffee.createFarm(addr1.address);

      // The farm (addr1) sets addr2 as a foreman
      await hardhatCoffee.connect(addr1).createForeman(addr2.address);

      const isForeman = await hardhatCoffee.isForeman(addr2.address);
      expect(isForeman).to.equal(true);
    });
  });

  describe("Checkin event", function () {
    it("Should emit event with caller address (foreman), worker address, and date", async function () {
      //set addr1 as a farm
      await hardhatCoffee.createFarm(addr1.address);
      //have the farm set addr2 to a foreman
      await hardhatCoffee.connect(addr1).createForeman(addr2.address);
      //now lets check in with addr3 as worker
      await hardhatCoffee
        .connect(addr2)
        .checkIn([addr3.address], "August 24th, 2000");
      //now we should expect the correct event to fire
      await expect(
        hardhatCoffee
          .connect(addr2)
          .checkIn([addr3.address], "August 24th, 2000")
      )
        .to.emit(hardhatCoffee, "workerCheckedIn")
        .withArgs(addr2.address, addr3.address, "August 24th, 2000");
    });
  });
  describe("Foreman attempts to create farm", function () {
    it("Should fail", async function () {
      //set addr1 as a farm
      await hardhatCoffee.createFarm(addr1.address);
      //have the farm set addr2 to a foreman
      await hardhatCoffee.connect(addr1).createForeman(addr2.address);
      //now have the foreman try to create a farm
      await expect(hardhatCoffee.connect(addr2).createFarm(addr2.address)).to.be
        .reverted;
    });
  });

  describe("Non-owner tries to pay worker", function () {
    it("Should fail", async function () {
      let workers = [addr3.address];
      let amounts = [4];
      let date = "09/18/2022";
      //set addr1 as a farm
      await hardhatCoffee.createFarm(addr1.address);
      //have the farm set addr2 to a foreman
      await hardhatCoffee.connect(addr1).createForeman(addr2.address);
      //now have the foreman try to create a farm
      await expect(
        hardhatCoffee.connect(addr2).payWorkers(workers, amounts, date, {
          value: 4,
        })
      ).to.be.reverted;
    });
  });

  describe("farm tries to pay workers", function () {
    it("Should pass and emit proper events and correctly update account balances", async function () {
      //build args for payWorkers
      let workers = [addr2.address, addr3.address];
      let amounts = [2, 4];
      let date = "09/12/2022";
      //set addr1 as a farm
      await hardhatCoffee.createFarm(addr1.address);

      await expect(
        hardhatCoffee.connect(addr1).payWorkers(workers, amounts, date, {
          value: 6,
        })
      )
        .to.emit(hardhatCoffee, "workerPaid")
        .withArgs(addr1.address, addr2.address, amounts[0], date)
        .and.to.emit(hardhatCoffee, "workerPaid")
        .withArgs(addr1.address, addr3.address, amounts[1], date);
    });
  });

  // Negative tests to write for paying workers:
  // farm sends not enough currency (transactions paying all workers should revert)
  describe("farm tries to pay workers with not enough money", function () {
    it("Should revert with the proper error message", async function () {
      //build args for payWorkers
      let workers = [addr2.address, addr3.address];
      let amounts = [2, 4];
      let date = "09/12/2022";
      //set addr1 as a farm
      await hardhatCoffee.createFarm(addr1.address);

      await expect(
        hardhatCoffee.connect(addr1).payWorkers(workers, amounts, date, {
          value: 3,
        })
      ).to.be.reverted;
    });
  });

  // farm sends too much currency (should revert)
  describe("farm pays too much money to workers", function () {
    it("Should pass and emit proper events and correctly return extra funds to the sender", async function () {
      //build args for payWorkers
      let workers = [addr2.address, addr3.address];
      let amounts = [2, 4];
      let date = "09/12/2022";
      //set addr1 as a farm
      await hardhatCoffee.createFarm(addr1.address);

      await expect(
        hardhatCoffee.connect(addr1).payWorkers(workers, amounts, date, {
          value: 8,
        })
      ).to.be.reverted;
    });
  });

  // farm tries to pay an invalid address (transactions paying all workers should revert)
});
