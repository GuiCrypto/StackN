import { useState } from "react";
import useEth from "../contexts/EthContext/useEth";

const StackNDCA = () => {
  const {
    state: { contract, accounts, web3 },
  } = useEth();

  const [readApproveAmount, setApproveAmount] = useState("");
  const [readDepositUsdcAmount, setDepositUsdcAmount] = useState("");
  const [readIntegerFromContract, setIntegerFromContract] = useState("");
  const [readUsdcDcaFromContract, setUsdcDcaFromContract] = useState("");
  const [readEthDcaFromContract, setEthDcaFromContract] = useState("");
  const [readStackNDcaFromContract, setStackNDcaFromContract] = useState("");
  const [readDcaAmount, setDcaAmount] = useState("");

  const usdcMultiplier = 1000000;
  const ethMultiplier = 1000000000000000000;

  const usdcBalance = async () => {
    const value = await contract.methods.getMyUsdcBalance().call({ from: accounts[0] }) / usdcMultiplier;
    setIntegerFromContract(value);

};

    const widthdrawUsdcBalance = async () => {
        const value = await contract.methods.widthdrawUsdc().send({ from: accounts[0] });
      };

    const usdcDca = async () => {
    const value = await contract.methods.getMyUsdcDca().call({ from: accounts[0] }) / usdcMultiplier;
    setUsdcDcaFromContract(value);
    };

    const ethBalance = async () => {
    const value = await contract.methods.getMyEthBalance().call({ from: accounts[0] }) / ethMultiplier;
    setEthDcaFromContract(value);
    };


    const stackNBalance = async () => {
        const value = await contract.methods.getMyStackNBalance().call({ from: accounts[0] }) / ethMultiplier;
        setStackNDcaFromContract(value);
        };

    const widthdrawEthBalance = async () => {
        const value = await contract.methods.widthdrawEth().send({ from: accounts[0] });
        };

    const widthdrawStackNBalance = async () => {
    const value = await contract.methods.widthdrawStackN().send({ from: accounts[0] });
    };


    const makeDca = async () => {
        const value = await contract.methods.makeDCA().send({ from: accounts[0] });
        };

    const sendApprove = async (e) => {
            if (e.target.tagName === "INPUT") {
              return;
            }
            if (readApproveAmount === "") {
              alert("Please enter a integer value to write.");
              return;
            }
            const erc20abi =  [
                {
                    "anonymous": false,
                    "inputs": [
                        {
                            "indexed": true,
                            "internalType": "address",
                            "name": "owner",
                            "type": "address"
                        },
                        {
                            "indexed": true,
                            "internalType": "address",
                            "name": "spender",
                            "type": "address"
                        },
                        {
                            "indexed": false,
                            "internalType": "uint256",
                            "name": "value",
                            "type": "uint256"
                        }
                    ],
                    "name": "Approval",
                    "type": "event"
                },
                {
                    "anonymous": false,
                    "inputs": [
                        {
                            "indexed": true,
                            "internalType": "address",
                            "name": "from",
                            "type": "address"
                        },
                        {
                            "indexed": true,
                            "internalType": "address",
                            "name": "to",
                            "type": "address"
                        },
                        {
                            "indexed": false,
                            "internalType": "uint256",
                            "name": "value",
                            "type": "uint256"
                        }
                    ],
                    "name": "Transfer",
                    "type": "event"
                },
                {
                    "inputs": [
                        {
                            "internalType": "address",
                            "name": "owner",
                            "type": "address"
                        },
                        {
                            "internalType": "address",
                            "name": "spender",
                            "type": "address"
                        }
                    ],
                    "name": "allowance",
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
                            "name": "spender",
                            "type": "address"
                        },
                        {
                            "internalType": "uint256",
                            "name": "amount",
                            "type": "uint256"
                        }
                    ],
                    "name": "approve",
                    "outputs": [
                        {
                            "internalType": "bool",
                            "name": "",
                            "type": "bool"
                        }
                    ],
                    "stateMutability": "nonpayable",
                    "type": "function"
                },
                {
                    "inputs": [
                        {
                            "internalType": "address",
                            "name": "account",
                            "type": "address"
                        }
                    ],
                    "name": "balanceOf",
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
                    "inputs": [],
                    "name": "totalSupply",
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
                            "name": "to",
                            "type": "address"
                        },
                        {
                            "internalType": "uint256",
                            "name": "amount",
                            "type": "uint256"
                        }
                    ],
                    "name": "transfer",
                    "outputs": [
                        {
                            "internalType": "bool",
                            "name": "",
                            "type": "bool"
                        }
                    ],
                    "stateMutability": "nonpayable",
                    "type": "function"
                },
                {
                    "inputs": [
                        {
                            "internalType": "address",
                            "name": "from",
                            "type": "address"
                        },
                        {
                            "internalType": "address",
                            "name": "to",
                            "type": "address"
                        },
                        {
                            "internalType": "uint256",
                            "name": "amount",
                            "type": "uint256"
                        }
                    ],
                    "name": "transferFrom",
                    "outputs": [
                        {
                            "internalType": "bool",
                            "name": "",
                            "type": "bool"
                        }
                    ],
                    "stateMutability": "nonpayable",
                    "type": "function"
                }
            ];
            const usdcAddress = await contract.methods.usdcSmartContractAddress().call({ from: accounts[0] });
            const  usdcContract  =  new  web3.eth.Contract(erc20abi, usdcAddress);
            const newValue = parseInt(readApproveAmount * usdcMultiplier);
            console.log("approve", newValue, contract?._address, usdcAddress)
            await usdcContract.methods.approve(contract?._address, newValue).send({ from: accounts[0]});  
        };

        // Setter config
        const approveHandleInputChange = (e) => {
            //if (/^\d+$|^$/.test(e.target.value)) {
            if (/^(\d+(\.\d*)?|\.\d+)$|^$/.test(e.target.value)) {
                setApproveAmount(e.target.value);
            }
        };

        const depositUsdc = async (e) => {
            if (e.target.tagName === "INPUT") {
              return;
            }
            if (readDepositUsdcAmount === "") {
              alert("Please enter a integer value to write.");
              return;
            }
            const newValue = parseInt(readDepositUsdcAmount * usdcMultiplier);
            console.log("deposit", readDepositUsdcAmount, newValue)
            await contract.methods.depositUsdc(newValue).send({ from: accounts[0] });
          };

        const depositHandleInputChange = (e) => {
            if (/^(\d+(\.\d*)?|\.\d+)$|^$/.test(e.target.value)) {
                setDepositUsdcAmount(e.target.value);
            }
        };


    const sendDcaAmount = async (e) => {
        if (e.target.tagName === "INPUT") {
          return;
        }
        if (readDcaAmount === "") {
          alert("Please enter a integer value to write.");
          return;
        }
        const newValue = parseInt(readDcaAmount * usdcMultiplier);
        await contract.methods.dcaAmount(newValue).send({ from: accounts[0] });
      };

    // Setter config
    const handleInputChange = (e) => {
        if (/^(\d+(\.\d*)?|\.\d+)$|^$/.test(e.target.value)) {
        setDcaAmount(e.target.value);
        }
    };

  return (
    <div>
      <h1>Stack N</h1>
      <br />
      <p>You are connected with this address: {accounts}</p>
      <p>Stack N smart contract : {contract?._address}</p>
      <br />
      
      <h2>How to make your Dollar Cost Average ?</h2>
        <p>1. Authorize Stack N to make a withdrawal from your account.</p>
        <div>
            <label>
            <input
                type="text"
                placeholder="Usdc amount to approve"
                value={readApproveAmount}
                onChange={approveHandleInputChange}
            />
            </label>
            <button onClick={sendApprove}>send</button>
            </div>
        <p>1. Deposit your USDC to the contract</p>
            <div>
            <label>
            <input
                type="text"
                placeholder="Usdc amount to deposit on your stackN account"
                value={readDepositUsdcAmount}
                onChange={depositHandleInputChange}
            />
            </label>
            <button onClick={depositUsdc}>send usdc</button>
            </div>
        <p>2. Set your monthly DCA</p>
            <div>
            <label>
            <input
                type="text"
                placeholder="Usdc amount to swap each month"
                value={readDcaAmount}
                onChange={handleInputChange}
            />
            </label>
            <button onClick={sendDcaAmount}>monthly usdc DCA</button>
            </div>
        <p>3. Wait for the next month</p>

    <h2>Launch Dollar Cost Average</h2>
      <div>
        <br/>
        <button onClick={makeDca}>make dca</button>
        <br/>
        </div>

        <br/>
        <br/>
        <h2>Balances</h2>
        <div>
        <button onClick={usdcBalance}>my usdc balances</button>
        {readIntegerFromContract}
        </div>
        
        <div>
        <button onClick={ethBalance}>my eth balance</button>
        {readEthDcaFromContract}
        </div>

        <div>
        <button onClick={stackNBalance}>my stackN balance</button>
        {readStackNDcaFromContract}
        </div>
        
        <div>
        <button onClick={usdcDca}>my monthly dca</button>
        {readUsdcDcaFromContract}
        </div>
        <br/>
        <br/>
      <h2>Withdraw</h2>
        <div>
        <button onClick={widthdrawUsdcBalance}>widthdraw usdc</button>
        </div>

        <div>
        <button onClick={widthdrawEthBalance}>widthdraw eth</button>
        </div>

        <div>
        <button onClick={widthdrawStackNBalance}>widthdraw StackN</button>
        </div>        

    </div>
  );
};
export default StackNDCA;
