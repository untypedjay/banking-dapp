import React, { useState, useEffect } from 'react'
import Web3 from 'web3'
import DaiToken from '../abis/DaiToken.json'
import DappToken from '../abis/DappToken.json'
import TokenFarm from '../abis/TokenFarm.json'
import Navbar from './Navbar'
import Main from './Main'
import './App.css'

function App() {
  const [account, setAccount] = useState('0x0');
  const [daiToken, setDaiToken] = useState({});
  const [dappToken, setDappToken] = useState({});
  const [tokenFarm, setTokenFarm] = useState({});
  const [daiTokenBalance, setDaiTokenBalance] = useState('0');
  const [dappTokenBalance, setDappTokenBalance] = useState('0');
  const [stakingBalance, setStakingBalance] = useState('0');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWeb3();
    loadBlockchainData();
  }, []);

  const loadBlockchainData = async () => {
    const accounts = await window.web3.eth.getAccounts();
    setAccount(accounts[0]);

    const networkId = await window.web3.eth.net.getId();

    // Load DaiToken
    const daiTokenData = DaiToken.networks[networkId];
    if (daiTokenData) {
      const daiToken = new window.web3.eth.Contract(DaiToken.abi, daiTokenData.address);
      setDaiToken(daiToken);
      let daiTokenBalance = await daiToken.methods.balanceOf(accounts[0]).call();
      setDaiTokenBalance(daiTokenBalance.toString());
    } else {
      alert('DaiToken contract not deployed to detected network.');
    }

    // Load DappToken
    const dappTokenData = DappToken.networks[networkId];
    if (dappTokenData) {
      const dappToken = new window.web3.eth.Contract(DappToken.abi, dappTokenData.address);
      setDappToken(dappToken);
      let dappTokenBalance = await dappToken.methods.balanceOf(accounts[0]).call();
      setDappTokenBalance(dappTokenBalance.toString());
    } else {
      alert('DappToken contract not deployed to detected network.');
    }

    // Load TokenFarm
    const tokenFarmData = TokenFarm.networks[networkId];
    if (tokenFarmData) {
      const tokenFarm = new window.web3.eth.Contract(TokenFarm.abi, tokenFarmData.address);
      setTokenFarm(tokenFarm);
      let stakingBalance = await tokenFarm.methods.stakingBalance(accounts[0]).call();
      setStakingBalance(stakingBalance.toString());
    } else {
      alert('TokenFarm contract not deployed to detected network.');
    }

    setLoading(false);
  };

  const loadWeb3 = async () => {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      await window.ethereum.enable();
    } else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider);
    } else {
      alert('Non-Ethereum browser detected. You should consider trying MetaMask!');
    }
  };

  const stakeTokens = amount => {
    setLoading(true);
    daiToken.methods.approve(tokenFarm._address, amount).send({ from: account }).on('transactionHash', (hash) => {
      tokenFarm.methods.stakeTokens(amount).send({ from: account }).on('transactionHash', (hash) => {
        setLoading(false);
      })
    });
  };

  const unstakeTokens = amount => {
    setLoading(true);
    tokenFarm.methods.unstakeTokens().send({ from: account }).on('transactionHash', () => setLoading(false));
  };

  let content
  if (loading) {
    content = <p id="loader" className="text-center">Loading...</p>
  } else {
    content = <Main
      daiTokenBalance={daiTokenBalance}
      dappTokenBalance={dappTokenBalance}
      stakingBalance={stakingBalance}
      stakeTokens={stakeTokens}
      unstakeTokens={unstakeTokens}
    />
  }

  return (
    <div>
      <Navbar account={account} />
      <div className="container-fluid mt-5">
        <div className="row">
          <main role="main" className="col-lg-12 ml-auto mr-auto" style={{ maxWidth: '600px' }}>
            <div className="content mr-auto ml-auto">
              {content}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

export default App;