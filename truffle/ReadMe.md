# My DCA Smart Contract

## Introduction

This repository contains the smart contract for the My DCA (Dollar Cost Averaging) platform. The My DCA platform allows users to automate the process of investing in cryptocurrencies, specifically Ethereum (ETH) and StackN (STKN). By using this smart contract, users can deposit USD Coin (USDC) and have it automatically converted into the desired cryptocurrency at regular intervals, reducing the impact of market volatility.

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Testing](#testing)
- [Security](#security)
- [License](#license)

## Features

The My DCA Smart Contract includes the following features:

1. Deposit USDC
2. Set up a DCA plan for ETH 
3. Withdraw ETH, STKN, or USDC
4. Get balances and DCA plan information

## Installation

To use the My DCA Smart Contract, follow these steps:

1. Clone the repository: `git clone https://github.com/my-dca/smart-contract.git`
2. Install the required dependencies: `npm install`
3. Compile the smart contract: `truffle compile`
4. Deploy the smart contract to your preferred network: `truffle migrate --network NETWORK_NAME`

## Usage

The following are examples of how to interact with the smart contract using JavaScript and the Web3 library:

1. Deposit USDC: `contract.methods.depositUsdc(amount).send({from: userAddress})`
2. Set up a DCA plan for ETH or STKN: `contract.methods.setupDcaPlan(tokenAddress, interval, amount).send({from: userAddress})`
3. Withdraw ETH, STKN, or USDC: `contract.methods.withdrawToken(tokenAddress).send({from: userAddress})`
4. Get balances and DCA plan information: `contract.methods.getMyTokenBalance(tokenAddress).call({from: userAddress})`

For more detailed usage instructions and examples, refer to the [Usage Guide](USAGE.md) in this repository.

## Testing

To run tests for the smart contract, follow these steps:

1. Start a local Ethereum network, such as Ganache: `ganache-cli`
2. Run the tests: `truffle test`

## Security

The My DCA Smart Contract has been audited by an external security firm. However, it is recommended to use this smart contract at your own risk. The developers and maintainers of this repository are not responsible for any losses incurred due to the use of the smart contract.

## License

The My DCA Smart Contract is released under the [MIT License](LICENSE).
