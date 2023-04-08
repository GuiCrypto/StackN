async function makeDepositAndwidthdraw() {

    var  Web3  =  require('web3');
    require('dotenv').config();
    const HDWalletProvider = require('@truffle/hdwallet-provider');
    provider = new HDWalletProvider(`${process.env.MNEMONIC}`, `https://goerli.infura.io/v3/${process.env.INFURA_ID}`)

    web3 = new Web3(provider);

    var  abi  = [
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "amountIn",
                    "type": "uint256"
                }
            ],
            "name": "depositUsdc",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "myUsdcBalance",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "",
                    "type": "address"
                }
            ],
            "name": "userAccounts",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "usdcAmount",
                    "type": "uint256"
                },
                {
                    "internalType": "uint256",
                    "name": "usdcDCA",
                    "type": "uint256"
                },
                {
                    "internalType": "uint256",
                    "name": "ethAmount",
                    "type": "uint256"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "amountOu",
                    "type": "uint256"
                }
            ],
            "name": "widthdrawUsdc",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        }
    ]


    accountAddress = await web3.eth.getAccounts();
    accountAddress = accountAddress[0];
    console.log('using address', accountAddress);

    stackNAddress = "0xB5c08AA488aE7f3febF04b8915b63709D66Fd4db"
    var  Contract  =  new  web3.eth.Contract(abi, stackNAddress);
    Contract.methods.myUsdcBalance().call().then(console.log);
    await Contract.methods.depositUsdc(1000000000).send({ from: accountAddress});
    Contract.methods.myUsdcBalance().call().then(console.log);

}

makeDepositAndwidthdraw();


