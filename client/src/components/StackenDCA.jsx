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
  const [readDcaAmount, setDcaAmount] = useState("");


  // getter config
  const usdcBalance = async () => {
    const value = await contract.methods.getMyUsdcBalance().call({ from: accounts[0] });
    setIntegerFromContract(value);

};

    // getter config
    const widthdrawUsdcBalance = async () => {
        const value = await contract.methods.widthdrawUsdc().send({ from: accounts[0] });
      };

// getter config
const usdcDca = async () => {
    const value = await contract.methods.getMyUsdcDca().call({ from: accounts[0] });
    setUsdcDcaFromContract(value);
    };

    // getter config
const ethBalance = async () => {
    const value = await contract.methods.getMyEthBalance().call({ from: accounts[0] });
    setEthDcaFromContract(value);
    };

    // getter config
const widthdrawEthBalance = async () => {
        const value = await contract.methods.widthdrawEth().send({ from: accounts[0] });
        };

    // getter config
    const makeDca = async () => {
        const value = await contract.methods.makeDCA().send({ from: accounts[0] });
        setMakeDcaFromContract(value);
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
            console.log("usdcAddress", usdcAddress)
            const  usdcContract  =  new  web3.eth.Contract(erc20abi, usdcAddress);
            await usdcContract.methods.approve(contract?._address, readApproveAmount).send({ from: accounts[0]});  
        };

        // Setter config
        const approveHandleInputChange = (e) => {
            if (/^\d+$|^$/.test(e.target.value)) {
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
            const newValue = parseInt(readDepositUsdcAmount);
            await contract.methods.depositUsdc(newValue).send({ from: accounts[0] });
          };


        // Setter config
        const depositHandleInputChange = (e) => {
            if (/^\d+$|^$/.test(e.target.value)) {
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
        const newValue = parseInt(readDcaAmount);
        await contract.methods.dcaAmount(newValue).send({ from: accounts[0] });
      };

    // Setter config
    const handleInputChange = (e) => {
        if (/^\d+$|^$/.test(e.target.value)) {
        setDcaAmount(e.target.value);
        }
    };

  return (
    <div>
      <h1>Stack N</h1>
      <br />
      <p>You are connected with this address: {accounts}</p>
      <br />
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
        <button onClick={usdcDca}>my monthly dca</button>
        {readUsdcDcaFromContract}
        </div>

      <h2>Withdraw</h2>
        <div>
        <button onClick={widthdrawUsdcBalance}>widthdraw usdc</button>
        </div>

        <div>
        <button onClick={widthdrawEthBalance}>widthdraw eth</button>
        </div>
        
      <h2>Launch Dollar Cost Average</h2>
      <div>
        <button onClick={makeDca}>make dca</button>
        {/* {readMakeDcaFromContract} */}
        </div>
      <h2>How to make your Dollar Cost Average ?</h2>
        <p>1. Authorize Stack N to make a withdrawal from your account.</p>
        <div>
            <label>
            <input
                type="text"
                placeholder="integer"
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
                placeholder="integer"
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
                placeholder="integer"
                value={readDcaAmount}
                onChange={handleInputChange}
            />
            </label>
            <button onClick={sendDcaAmount}>monthly usdc DCA</button>
            </div>
        <p>3. Wait for the next month</p>
    </div>
  );
};
export default StackNDCA;
