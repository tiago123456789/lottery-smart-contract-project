import "./App.css";
import React, { useEffect, useState } from "react";
import web3 from "./services/web3";
import lottery from "./services/lottery";

function App() {
  const [manager, setManager] = useState();
  const [players, setPlayers] = useState([]);
  const [balance, setBalance] = useState(0)
  const [value, setValue] = useState(0);
  const [message, setMessage] = useState("");
  const [action, setAction] = useState(null)

  const loadData = async () => {
    const [manager, players, balance] = await Promise.all([
      lottery.methods.manager().call(),
      lottery.methods.getPlayers().call(),
      web3.eth.getBalance(lottery.options.address)
    ])
    setManager(manager)
    setPlayers(players)
    setBalance(balance)
  }

  const cleanMessageAfterSecond = (seconds) => {
    setTimeout(() => {
      setMessage("")
      setAction(null)
    }, (seconds * 1000))
  }

  const submit = async (event) => {
    event.preventDefault();
    try {
      setAction("enter")
      setMessage("Waiting transaction process....")
      const accounts = await web3.eth.getAccounts();
      await lottery.methods.enter().send({
        from: accounts[0],
        value: web3.utils.toWei(value, "ether")
      })
      await loadData()
      setMessage("Transaction processed success")
    } catch (error) {
      setMessage("Occour error while try process transaction")
    } finally {
      cleanMessageAfterSecond(5)
    }
  }

  const pickWinner = async (event) => {
    event.preventDefault();
    try {
      setAction("pickWinner")
      setMessage("Waiting transaction process....")
      const accounts = await web3.eth.getAccounts();
      await lottery.methods.pickWinner().send({
        from: accounts[0],
      })
      await loadData()
      setMessage("Transaction processed success")
    } catch (error) {
      setMessage("Occour error while try process transaction")
    } finally {
      cleanMessageAfterSecond(5)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  return (
    <div className="App">
      <h2>Lottery contract</h2>
      <h3>This contract is managed by {manager}</h3>
      <p>There are currently {players.length} entered, competing to win {web3.utils.fromWei(balance, "ether")} ether!</p>
      <hr />
      <h2>Want to try luck?</h2>
      {(message && action === "enter") &&
        <p style={{ fontSize: "2em" }}>{message}</p>
      }
      <form onSubmit={submit}>
        <label>Enter ether value:</label><br />
        <input
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="0.011" />
        <button type="submit" >Enter</button>
      </form>

      <hr />
      <h2>Pick winner</h2>
      {(message && action === "pickWinner") &&
        <p style={{ fontSize: "2em" }}>{message}</p>
      }
      <form onSubmit={pickWinner}>
        <button type="submit" >Pick winner</button>
      </form>
    </div>
  );
}
export default App;
