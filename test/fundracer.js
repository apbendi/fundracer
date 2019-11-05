const FundRace = artifacts.require("FundRace");
const devParams = require("../dev-params");
const ERC20ABI = require("./helpers/erc20-abi");

contract("FundRace", _accounts => {

    var instance = null;
    var token = null

    before(async () => {
        instance = await FundRace.deployed();
        token = new web3.eth.Contract(ERC20ABI, devParams.tokenAddr);
    });

    it("should deploy with the correct initalization parameters", async () => {
        let racer1 = await instance.racer1();
        let racer2 = await instance.racer2();
        let donationToken = await instance.donationToken();

        assert.equal(racer1, devParams.racer1, "Incorrect racer1 deployed");
        assert.equal(racer2, devParams.racer2, "Incorrect racer2 deployed");
        assert.equal(donationToken, token.options.address, "Incorrect token deployed");
    });
});
