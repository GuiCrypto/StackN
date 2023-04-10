async function getEthUsdPrice() {

    const  Web3  =  require('web3');
    require('dotenv').config();
    const HDWalletProvider = require('@truffle/hdwallet-provider');
    provider = new HDWalletProvider(`${process.env.MNEMONIC}`, `https://goerli.infura.io/v3/${process.env.INFURA_ID}`)

    web3 = new Web3(provider);

    const  chainlinkAbi  = [
        {
          "inputs": [],
          "stateMutability": "nonpayable",
          "type": "constructor"
        },
        {
          "inputs": [],
          "name": "getLatestPrice",
          "outputs": [
            {
              "internalType": "int256",
              "name": "",
              "type": "int256"
            }
          ],
          "stateMutability": "view",
          "type": "function",
          "constant": true
        }
      ]

    addrChainlink = "0x03289926aBa4Dce0236f41bB843489E68Cb3802b";

    accounts = await web3.eth.getAccounts();
    accountAddress = accounts[0];
    console.log('using address', accountAddress);

    const  chainlinkContract  =  new  web3.eth.Contract(chainlinkAbi, addrChainlink);

    const slippage = 0.01; // 1% slippage

    // get the current ETH/USD price
    const currentPrice = await chainlinkContract.methods.getLatestPrice().call();
    console.log('Current ETH/USD price:', currentPrice);

    // calculate the minimum ETH/USD price you're willing to accept, factoring in slippage
    const minPrice = Math.floor(currentPrice * (1 - slippage) * 100) / 100;
    console.log('Minimum ETH/USD price with 1% slippage:', minPrice);

    // calculate the maximum amount of ETH you can trade at the minimum price
    const maxEth = Math.floor(10000 * minPrice) / 10000; // assuming you're trading in increments of 0.0001 ETH
    console.log('Maximum ETH you can trade at the minimum price:', maxEth);
}

getEthUsdPrice();