const { expect, use } = require("chai");
const { ethers } = require("hardhat");
const {
  isCallTrace,
} = require("hardhat/internal/hardhat-network/stack-traces/message-trace");

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
      const isFarm = await hardhatCoffee.isAddressFarm(addr1.address);

      expect(isFarm).to.equal(true);
    });
  });

  describe("Foreman creation", function () {
    it("Should assign an address as a foreman", async function () {
      // Sets addr1 as a farm
      await hardhatCoffee.createFarm(addr1.address);

      // The farm (addr1) sets addr2 as a foreman
      await hardhatCoffee.connect(addr1).createForeman(addr2.address);

      const isForeman = await hardhatCoffee.isAddressForeman(addr2.address);
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
      //set addr1 as a farm
      await hardhatCoffee.createFarm(addr1.address);
      //have the farm set addr2 to a foreman
      await hardhatCoffee.connect(addr1).createForeman(addr2.address);
      //now have the foreman try to create a farm
      await expect(hardhatCoffee.connect(addr2).payWorker(addr3.address)).to.be
        .reverted;
    });
  });

  describe("farm tries to pay worker", function () {
    it("Should pass and emit proper event", async function () {
      //set addr1 as a farm
      await hardhatCoffee.createFarm(addr1.address);

      //now have the foreman try to create a farm
      await expect(
        hardhatCoffee.connect(addr1).payWorker(addr3.address, {
          value: ethers.utils.parseEther("1.0"),
        })
      )
        .to.emit(hardhatCoffee, "workerPaid")
        .withArgs(addr1.address, addr3.address, ethers.utils.parseEther("1.0"));
    });
  });

  describe("isForeman call after initializing a foreman", function () {
    it("Should return true", async function () {
      //set addr1 as a farm
      await hardhatCoffee.createFarm(addr1.address);
      //have the farm set addr2 to a foreman
      await hardhatCoffee.connect(addr1).createForeman(addr2.address);
      //now we will call isForeman and pass it the address of the newly created foreman
      //we will expect this to return true
      const res = await hardhatCoffee
        .connect(addr1)
        .isAddressForeman(addr2.address);
      await expect(res).to.be.true;
    });
  });

  describe("isFarm call after initializing a farm", function () {
    it("Should return true", async function () {
      //set addr1 as a farm
      await hardhatCoffee.createFarm(addr1.address);
      //call isAddressFarm from owner address and pass it addr1
      //should be true
      const res = await hardhatCoffee.isAddressFarm(addr1.address);
      await expect(res).to.be.true;
    });
  });

  // Negative tests to write for paying workers:
  // farm sends not enough currency
  // farm sends too much currency
  // farm tries to pay an invalid address

});
