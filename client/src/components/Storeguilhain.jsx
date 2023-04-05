import { useState } from "react";
import useEth from "../contexts/EthContext/useEth";

const Storeguilhain = () => {
  const {
    state: { contract, accounts, web3 },
  } = useEth();
  const [inputValue, setInputValue] = useState("");
  const [readIntegerFromContract, setIntegerFromContract] = useState("");
  const [greetText, setGreetText] = useState("");
  const [greetTextFromContract, setGreetTextFromContract] = useState("");
  const [events, setEvents] = useState([]);

  console.log("accounts", accounts)
  console.log("accounts 0", accounts?.[0])

  // getter config
  const read = async () => {
    const value = await contract.methods.read().call({ from: accounts[0] });
    setIntegerFromContract(value);
  };

  const greet = async () => {
    const text = await contract.methods.greet().call({ from: accounts[0] });
    setGreetTextFromContract(text);
  };

  // Setter config
  const handleInputChange = (e) => {
    if (/^\d+$|^$/.test(e.target.value)) {
      setInputValue(e.target.value);
    }
  };

  const sendWrite = async (e) => {
    if (e.target.tagName === "INPUT") {
      return;
    }
    if (inputValue === "") {
      alert("Please enter a integer value to write.");
      return;
    }
    const newValue = parseInt(inputValue);
    await contract.methods.write(newValue).send({ from: accounts[0] });
  };

  const handleInputTextChange = (e) => {
    setGreetText(e.target.value);
  };

  const sendGreetText = async (e) => {
    if (e.target.tagName === "INPUT") {
      return;
    }
    if (greetText === "") {
      alert("Please enter a string value to write.");
      return;
    }
    const newText = greetText;
    await contract.methods.setGreet(newText).send({ from: accounts[0] });
  };

  // envent listener
  // const getEventsWrite = async (event) => {
  const getEventsWrite = async () => {
    const events = await contract.getPastEvents("ValueChanged", {
      fromBlock: 0,
      toBlock: "latest",
    });
    const myEvents = events.map((event) => event.returnValues.newValue);
    setEvents(myEvents);
  };

  return (
    <div>
      <h1>Simple Storage</h1>
      <br />
      <p>You are connected with this address: {accounts}</p>
      <br />

      <div>
        <label>
          Write
          <input
            type="text"
            placeholder="integer"
            value={inputValue}
            onChange={handleInputChange}
          />
        </label>
        <button onClick={sendWrite}>send</button>
      </div>

      <br />
      <div>
        <button onClick={read}>read()</button>
        {readIntegerFromContract}
      </div>
      <br />
      <div>
        <label>
          setGreet
          <input
            type="text"
            placeholder="string"
            value={greetText}
            onChange={handleInputTextChange}
          />
        </label>
        <button onClick={sendGreetText}>send</button>
      </div>
      <div>
        <button onClick={greet}>greet()</button>
        {greetTextFromContract}
      </div>
      <button onClick={getEventsWrite}>Get Events</button>
      {events.map((e, index) => (
        <p key={index}>{e}</p>
      ))}
      {/* <button onClick={e => getEventsWrite(e)}>Get Events</button> */}
    </div>
  );
};
export default Storeguilhain;
