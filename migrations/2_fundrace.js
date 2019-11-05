const FundRace = artifacts.require("FundRace");
const devParams = require("../dev-params");

module.exports = function(deployer, network) {

    if ('development' === network) {
        deployer.deploy(FundRace, devParams.racer1, devParams.racer2);
    } else {
        throw new Error("Unknown Network: " + network);
    }
};
