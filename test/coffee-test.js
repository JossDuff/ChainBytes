const { expect, use } = require("chai");
const { ethers } = require("hardhat");
const {
  isCallTrace,
} = require("hardhat/internal/hardhat-network/stack-traces/message-trace");
const provider = ethers.getDefaultProvider();
describe("coffee contract", function () {
  let owner;
  let addr1;
  let addr2;
  let addr3;

  beforeEach(async function () {
    coffee = await ethers.getContractFactory("coffee");
    [owner, addr1, addr2, addr3] = await ethers.getSigners();

    // Deploys contract
    hardhatCoffee = await coffee.deploy();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await hardhatCoffee.owner()).to.equal(owner.address);
    });
  });

  describe("Farm creation", function () {
    it("Should assign an address as a farm", async function () {
      await hardhatCoffee.createFarm(addr1.address);
      const isFarm = await hardhatCoffee.isFarm(addr1.address);

      expect(isFarm).to.equal(true);
    });
  });

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
        .checkIn(addr3.address, "August 24th, 2000");
      //now we should expect the correct event to fire
      await expect(
        hardhatCoffee.connect(addr2).checkIn(addr3.address, "August 24th, 2000")
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
          value: ethers.utils.parseEther("4.0"),
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
          value: ethers.utils.parseEther("6.0"),
        })
      )
        .to.emit(hardhatCoffee, "workerPaid")
        .withArgs(addr1.address, addr2.address, amounts[0], date)
        .and.to.emit(hardhatCoffee, "workerPaid")
        .withArgs(addr1.address, addr3.address, amounts[1], date);
    });
  });

  // Negative tests to write for paying workers:
  // farm sends not enough currency (transactions paying all workers should revert
  // currently failing as of 09/18/22, need to rework batch payment function
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
          value: ethers.utils.parseEther("3.0"),
        })
      ).to.be.reverted;
    });
  });

  // farm sends too much currency (farm should be sent back the extra currency)
  // failing
  describe("farm pays too much money to workers", function () {
    it("Should pass and emit proper events and correctly return extra funds to the sender", async function () {
      //build args for payWorkers
      let workers = [addr2.address, addr3.address];
      let amounts = [2, 4];
      let date = "09/12/2022";
      //set addr1 as a farm
      await hardhatCoffee.createFarm(addr1.address);

      await hardhatCoffee.connect(addr1).payWorkers(workers, amounts, date, {
        value: ethers.utils.parseEther("8.0"),
      });
      let balance = await provider.getBalance(addr1.address);
      const balanceInEth = await ethers.utils.formatEther(balance);
      console.log(balanceInEth);
      expect(balanceInEth).to.equal(2);
    });
  });

  // farm tries to pay an invalid address (transactions paying all workers should revert)
});
