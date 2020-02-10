const FundRace = artifacts.require("FundRace");

contract("FundRace Splits", _accounts => {

    var instance = null;
    let utils = web3.utils;

    before(async () => {
        instance = await FundRace.deployed();
        assert(instance.address.startsWith("0x"), "Deployed Contract Not Found");
    });

    it("should return zeros when zero designations made", async () => {
        let zero = utils.toWei("0", "ether");
        let {racer1Take, racer2Take} = await instance.calculateSplits(zero, zero);

        assert.equal(racer1Take.toString(10), "0", "Unexpected Racer1 Take");
        assert.equal(racer2Take.toString(10), "0", "Unexpected Racer2 Take");
    });
});