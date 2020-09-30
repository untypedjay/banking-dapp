import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import Navbar from './Navbar';
import Main from './Main';
import DaiToken from '../abis/DaiToken.json';
import DappToken from '../abis/DappToken.json';
import TokenFarm from '../abis/TokenFarm.json';
import './App.css';

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
    getAccount().then(loadBlockchainData);
  }, []);

  const loadWeb3 = async () => {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      await window.ethereum.enable();
    } else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider);
    } else {
      alert('Non-Ethereum browser detected. You should consider trying MetaMask!');
    }
  }

  const getAccount = async () => {
    const accounts = await window.web3.eth.getAccounts();
    setAccount(accounts[0]);
  }

  const loadBlockchainData = async () => {
    const networkId = await window.web3.eth.net.getId();

    await loadDaiToken(DaiToken.networks[networkId]);
    await loadDappToken(DappToken.networks[networkId]);
    await loadTokenFarm(TokenFarm.networks[networkId]);

    setLoading(false);
  }

  const loadDaiToken = async data => {
    console.log(account)
    if (data) {
      const daiTokenObject = new window.web3.eth.Contract(DaiToken.abi, data.address);
      setDaiToken(daiTokenObject);
      let daiTokenBalanceObject = await daiTokenObject.methods.balanceOf(account).call();
      setDaiTokenBalance(daiTokenBalanceObject.toString());
    } else {
      alert('DaiToken contract not deployed to detected network.');
    }
  }

  const loadDappToken = async data => {
    if (data) {
      const dappTokenObject = new window.web3.eth.Contract(DappToken.abi, data.address);
      setDappToken(dappTokenObject);
      let dappTokenBalanceObject = await dappTokenObject.methods.balanceOf(account).call();
      setDappTokenBalance(dappTokenBalanceObject.toString());
    } else {
      alert('DappToken contract not deployed to detected network.');
    }
  }

  const loadTokenFarm = async data => {
    if (data) {
      const tokenFarmObject = new window.web3.eth.Contract(TokenFarm.abi, data.address);
      setTokenFarm(tokenFarmObject);
      let stakingBalanceObject = await tokenFarmObject.methods.stakingBalance(account).call();
      setStakingBalance(stakingBalanceObject.toString());
    } else {
      alert('TokenFarm contract not deployed to detected network.');
    }
  }

  const stakeTokens = amount => {
    setLoading(true);
    daiToken.methods.approve(tokenFarm._address, amount).send({from: account}).on('transactionHash', hash => {
      tokenFarm.methods.stakeTokens(amount).send({from: account}).on('transactionHash', hash => {
        setLoading(false);
      });
    });
  }

  const unstakeTokens = amount => {
    setLoading(true);
    tokenFarm.methods.unstakeTokens().send({ from: account }).on('transactionHash', hash => {
      setLoading(false);
    });
  }

  const renderContent = () => {
    if (loading) {
      return <p id="loader" className="text-center">Loading...</p>;
    } else {
      return <Main daiTokenBalance={daiTokenBalance}
                   dappTokenBalance={dappTokenBalance}
                   stakingBalance={stakingBalance}
                   stakeTokens={stakeTokens}
                   unstakeTokens={unstakeTokens}
      />
    }
  }

  return (
    <div>
      <Navbar account={account}/>
      <div className="container-fluid mt-5">
        <div className="row">
          <main role="main" className="col-lg-12 ml-auto mr-auto" style={{ maxWidth: '600px' }}>
            <div className="content mr-auto ml-auto">
              { renderContent() }
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

export default App;
