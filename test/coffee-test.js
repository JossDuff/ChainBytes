const { expect } = require("chai");
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
});
