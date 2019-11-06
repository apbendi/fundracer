const FundRace = artifacts.require("FundRace");
const generateParams = require("../dev-params")(web3);

module.exports = async function(deployer, network) {

    let devParams = await generateParams();

    if ('development' === network) {
        await deployer.deploy(FundRace,
                                devParams.racer1,
                                devParams.racer2,
                                devParams.endDate,
                                devParams.tokenAddr);
    } else {
        throw new Error("Unknown Network: " + network);
    }
};
