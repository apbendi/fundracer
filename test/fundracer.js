const FundRace = artifacts.require("FundRace");
const devParams = require("../dev-params");

contract("FundRace", _accounts => {

    var instance = null;

    before(async () => {
        instance = await FundRace.deployed();
    });

    it("should have the correct beneficiaries", async () => {
        let racer1 = await instance.racer1();
        let racer2 = await instance.racer2();

        assert.equal(racer1, devParams.racer1, "Incorrect racer1 deployed");
        assert.equal(racer2, devParams.racer2, "Incorrect racer2 deployed");
    });
});
