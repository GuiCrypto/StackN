
const StackNDCA = artifacts.require("StackNDCAMinute");
const StackNToken = artifacts.require("StackNToken");

module.exports = function (deployer) {
  deployer.deploy(StackNDCA).then((deployedStackNDCA) => {
    const stackNDCAAddress = deployedStackNDCA.address;
    return deployer.deploy(StackNToken, stackNDCAAddress).then((deployedStackNToken) => {
      const stackNTokenAddress = deployedStackNToken.address;
      return deployedStackNDCA.setStackNTockenAddress(stackNTokenAddress);
    });
  });
};
