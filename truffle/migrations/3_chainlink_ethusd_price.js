const ChainlinkEthUsd = artifacts.require("ChainlinkEthUsd");

module.exports = function(deployer) {
  deployer.deploy(ChainlinkEthUsd);
};

