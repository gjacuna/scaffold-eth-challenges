import WalletConnectProvider from "@walletconnect/web3-provider";
//import Torus from "@toruslabs/torus-embed"
import WalletLink from "walletlink";
import { Alert, Button, Card, Col, Menu, Row, Input, List, Divider, Steps, Space, Table } from "antd";
import "antd/dist/antd.css";
import React, { useCallback, useEffect, useState } from "react";
import { BrowserRouter, Link, Route, Switch } from "react-router-dom";
import Web3Modal from "web3modal";
import "./App.css";
import { Account, Address, Balance, Contract, Faucet, GasGauge, Header, Ramp, ThemeSwitch, DropdownMenu, Swap, TokenBalance } from "./components";
import { INFURA_ID, NETWORK, NETWORKS } from "./constants";
import { Transactor } from "./helpers";
import {
  useBalance,
  useContractLoader,
  useContractReader,
  useGasPrice,
  useOnBlock,
  useUserProviderAndSigner,
} from "eth-hooks";
import { useEventListener } from "eth-hooks/events/useEventListener";
import { useExchangeEthPrice } from "eth-hooks/dapps/dex";
// import Hints from "./Hints";
import { ExampleUI, Hints, Subgraph } from "./views";

import { useContractConfig } from "./hooks";
import Portis from "@portis/web3";
import Fortmatic from "fortmatic";
import Authereum from "authereum";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
ChartJS.register(ArcElement, Tooltip, Legend);

const { ethers } = require("ethers");
/*
    Welcome to 🏗 scaffold-eth !

    Code:
    https://github.com/austintgriffith/scaffold-eth

    Support:
    https://t.me/joinchat/KByvmRe5wkR-8F_zz6AjpA
    or DM @austingriffith on twitter or telegram

    You should get your own Infura.io ID and put it in `constants.js`
    (this is your connection to the main Ethereum network for ENS etc.)


    🌏 EXTERNAL CONTRACTS:
    You can also bring in contract artifacts in `constants.js`
    (and then use the `useExternalContractLoader()` hook!)
*/

/// 📡 What chain are your contracts deployed to?
const targetNetwork = NETWORKS.goerli; // <------- select your target frontend network (localhost, rinkeby, xdai, mainnet)
const polyNetwork = NETWORKS.matic;

// 😬 Sorry for all the console logging
const DEBUG = true;
const NETWORKCHECK = true;

// 🛰 providers
if (DEBUG) console.log("📡 Connecting to Mainnet Ethereum");
// const mainnetProvider = getDefaultProvider("mainnet", { infura: INFURA_ID, etherscan: ETHERSCAN_KEY, quorum: 1 });
// const mainnetProvider = new InfuraProvider("mainnet",INFURA_ID);
//
// attempt to connect to our own scaffold eth rpc and if that fails fall back to infura...
// Using StaticJsonRpcProvider as the chainId won't change see https://github.com/ethers-io/ethers.js/issues/901
const scaffoldEthProvider = navigator.onLine
  ? new ethers.providers.StaticJsonRpcProvider("https://rpc.scaffoldeth.io:48544")
  : null;
const poktMainnetProvider = navigator.onLine
  ? new ethers.providers.StaticJsonRpcProvider(
      "https://eth-mainnet.gateway.pokt.network/v1/lb/611156b4a585a20035148406",
    )
  : null;
const mainnetInfura = navigator.onLine
  ? new ethers.providers.StaticJsonRpcProvider("https://mainnet.infura.io/v3/" + INFURA_ID)
  : null;
// ( ⚠️ Getting "failed to meet quorum" errors? Check your INFURA_ID

// 🏠 Your local provider is usually pointed at your local blockchain
const localProviderUrl = targetNetwork.rpcUrl;
// as you deploy to other networks you can set REACT_APP_PROVIDER=https://dai.poa.network in packages/react-app/.env
const localProviderUrlFromEnv = process.env.REACT_APP_PROVIDER ? process.env.REACT_APP_PROVIDER : localProviderUrl;
if (DEBUG) console.log("🏠 Connecting to provider:", localProviderUrlFromEnv);
const localProvider = new ethers.providers.StaticJsonRpcProvider(localProviderUrlFromEnv);

// Provider for Polygon Network
const polyProviderUrl = polyNetwork.rpcUrl;
// as you deploy to other networks you can set REACT_APP_PROVIDER=https://dai.poa.network in packages/react-app/.env
const polyProviderUrlFromEnv = process.env.REACT_APP_MATIC_PROVIDER ? process.env.REACT_APP_MATIC_PROVIDER : polyProviderUrl;
if (DEBUG) console.log("Connecting to matic provider:", polyProviderUrlFromEnv);
const polyProvider = new ethers.providers.StaticJsonRpcProvider(polyProviderUrlFromEnv);

// 🔭 block explorer URL
const blockExplorer = targetNetwork.blockExplorer;

// Coinbase walletLink init
const walletLink = new WalletLink({
  appName: "coinbase",
});

// WalletLink provider
const walletLinkProvider = walletLink.makeWeb3Provider(`https://mainnet.infura.io/v3/${INFURA_ID}`, 1);

// Portis ID: 6255fb2b-58c8-433b-a2c9-62098c05ddc9
/*
  Web3 modal helps us "connect" external wallets:
*/
const web3Modal = new Web3Modal({
  network: "mainnet", // Optional. If using WalletConnect on xDai, change network to "xdai" and add RPC info below for xDai chain.
  cacheProvider: true, // optional
  theme: "light", // optional. Change to "dark" for a dark theme.
  providerOptions: {
    walletconnect: {
      package: WalletConnectProvider, // required
      options: {
        bridge: "https://polygon.bridge.walletconnect.org",
        infuraId: INFURA_ID,
        rpc: {
          1: `https://mainnet.infura.io/v3/${INFURA_ID}`, // mainnet // For more WalletConnect providers: https://docs.walletconnect.org/quick-start/dapps/web3-provider#required
          42: `https://kovan.infura.io/v3/${INFURA_ID}`,
          100: "https://dai.poa.network", // xDai
        },
      },
    },
    portis: {
      display: {
        logo: "https://user-images.githubusercontent.com/9419140/128913641-d025bc0c-e059-42de-a57b-422f196867ce.png",
        name: "Portis",
        description: "Connect to Portis App",
      },
      package: Portis,
      options: {
        id: "6255fb2b-58c8-433b-a2c9-62098c05ddc9",
      },
    },
    fortmatic: {
      package: Fortmatic, // required
      options: {
        key: "pk_live_5A7C91B2FC585A17", // required
      },
    },
    // torus: {
    //   package: Torus,
    //   options: {
    //     networkParams: {
    //       host: "https://localhost:8545", // optional
    //       chainId: 1337, // optional
    //       networkId: 1337 // optional
    //     },
    //     config: {
    //       buildEnv: "development" // optional
    //     },
    //   },
    // },
    "custom-walletlink": {
      display: {
        logo: "https://play-lh.googleusercontent.com/PjoJoG27miSglVBXoXrxBSLveV6e3EeBPpNY55aiUUBM9Q1RCETKCOqdOkX2ZydqVf0",
        name: "Coinbase",
        description: "Connect to Coinbase Wallet (not Coinbase App)",
      },
      package: walletLinkProvider,
      connector: async (provider, _options) => {
        await provider.enable();
        return provider;
      },
    },
    authereum: {
      package: Authereum, // required
    },
  },
});

function App(props) {
  const mainnetProvider =
    poktMainnetProvider && poktMainnetProvider._isProvider
      ? poktMainnetProvider
      : scaffoldEthProvider && scaffoldEthProvider._network
      ? scaffoldEthProvider
      : mainnetInfura;

  const [injectedProvider, setInjectedProvider] = useState();
  const [address, setAddress] = useState();

  const logoutOfWeb3Modal = async () => {
    await web3Modal.clearCachedProvider();
    if (injectedProvider && injectedProvider.provider && typeof injectedProvider.provider.disconnect == "function") {
      await injectedProvider.provider.disconnect();
    }
    setTimeout(() => {
      window.location.reload();
    }, 1);
  };

  /* 💵 This hook will get the price of ETH from 🦄 Uniswap: */
  const price = useExchangeEthPrice(targetNetwork, mainnetProvider);

  /* 🔥 This hook will get the price of Gas from ⛽️ EtherGasStation */
  const gasPrice = useGasPrice(targetNetwork, "fast");
  // Use your injected provider from 🦊 Metamask or if you don't have it then instantly generate a 🔥 burner wallet.
  const userProviderAndSigner = useUserProviderAndSigner(injectedProvider, localProvider);
  const userSigner = userProviderAndSigner.signer;

  useEffect(() => {
    async function getAddress() {
      if (userSigner) {
        const newAddress = await userSigner.getAddress();
        setAddress(newAddress);
      }
    }
    getAddress();
  }, [userSigner]);

  // You can warn the user if you would like them to be on a specific network
  const localChainId = localProvider && localProvider._network && localProvider._network.chainId;
  const selectedChainId =
    userSigner && userSigner.provider && userSigner.provider._network && userSigner.provider._network.chainId;

  // For more hooks, check out 🔗eth-hooks at: https://www.npmjs.com/package/eth-hooks

  // The transactor wraps transactions and provides notificiations
  const tx = Transactor(userSigner, gasPrice);

  // Faucet Tx can be used to send funds from the faucet
  const faucetTx = Transactor(localProvider, gasPrice);

  // 🏗 scaffold-eth is full of handy hooks like this one to get your balance:
  const yourLocalBalance = useBalance(localProvider, address);

  // Just plug in different 🛰 providers to get your balance on different chains:
  const yourMainnetBalance = useBalance(mainnetProvider, address);
  const yourMaticBalance = useBalance(polyProvider, address);

  const contractConfig = useContractConfig();

  //we check if address is a verified human on PoH
  // const human = isHuman(address);
  // console.log(human);

  // Load in your local 📝 contract and read a value from it:
  const readContracts = useContractLoader(localProvider, contractConfig);

  // If you want to make 🔐 write transactions to your contracts, use the userSigner:
  const writeContracts = useContractLoader(userSigner, contractConfig, localChainId);

  // EXTERNAL CONTRACT EXAMPLE:
  //
  // If you want to bring in the mainnet DAI contract it would look like:
  const mainnetContracts = useContractLoader(mainnetProvider, contractConfig);

  // If you want to bring in the mainnet DAI contract it would look like:
  const polyContracts = useContractLoader(polyProvider, contractConfig);

  // If you want to call a function on a new block
  useOnBlock(mainnetProvider, () => {
    console.log(`⛓ A new mainnet block is here: ${mainnetProvider._lastBlockNumber}`);
  });

  // Then read your DAI balance like:
  const myMainnetDAIBalance = useContractReader(polyContracts, "DAI", "balanceOf", [
    address,
  ]);

  // Polybalances
  const myPolyMCO2Balance = useContractReader(polyContracts, "PMCO2", "balanceOf", [
    address,
  ]);
  
  const myPolyBCTBalance = useContractReader(polyContracts, "PBCT", "balanceOf", [
    address,
  ]);

  const koyweTokenBalance = useContractReader(readContracts, "KoyweToken", "balanceOf", [address]);

  //keep track of contract balance to know how much has been staked total:
  const kpledgeContractBalance = useBalance(
    localProvider,
    readContracts && readContracts.KoywePledge ? readContracts.KoywePledge.address : null,
  );
  if (DEBUG) console.log("💵 kpledgeContractBalance", kpledgeContractBalance);

  // ** keep track of a variable from the contract in the local React state:
  const pledged = useContractReader(readContracts, "KoywePledge", "isPledged", [address]);
  console.log("💸 pledged:", pledged);

  // ** keep track of a variable from the contract in the local React state:
  const tonsPledged = useContractReader(readContracts, "KoywePledge", "getCommitment", [address]);
  console.log("💸 tons pledged:", tonsPledged ? tonsPledged.toString() : "...");

  // ** 📟 Listen for broadcast events
  const pledgeEvents = useEventListener(readContracts, "KoywePledge", "NewPledge", localProvider, 1);
  console.log("📟 pledge events:", pledgeEvents);

  const CO2TokenBalance = useContractReader(readContracts, "CO2TokenContract", "balanceOf", [address]);
  console.log("🏵 CO2TokenBalance:", CO2TokenBalance ? ethers.utils.formatEther(CO2TokenBalance) : "...");

  const vendorAddress = readContracts && readContracts.KoyweVendor && readContracts.KoyweVendor.address;

  const vendorTokenBalance = useContractReader(readContracts, "KoyweToken", "balanceOf", [vendorAddress]);
  console.log("🏵 vendorTokenBalance:", vendorTokenBalance ? ethers.utils.formatEther(vendorTokenBalance) : "...");

  const tokensPerEth = useContractReader(readContracts, "KoyweVendor", "tokensPerEth");
  console.log("🏦 tokensPerEth:", tokensPerEth ? tokensPerEth.toString() : "...");

  // ** Listen for when the contract has been 'completed'
  // const complete = useContractReader(readContracts, "CO2TokenContract", "completed");
  // console.log("✅ complete:", complete);

  // const cO2TokenContractBalance = useBalance(
  //   localProvider,
  //   readContracts && readContracts.CO2TokenContract ? readContracts.CO2TokenContract.address : null,
  // );
  // if (DEBUG) console.log("💵 cO2TokenContractBalance", cO2TokenContractBalance);

  const [tonsCommitted, setTonsCommitted] = useState();
  const [pledging, setPledging] = useState();
  const [dripping, setDripping] = useState();

  let pledgeDisplay = "";
  if (pledged) {
    pledgeDisplay = (
      <div style={{ padding: 64, backgroundColor: "#eeffef", fontWeight: "bolder" }}>
        🌳🌳 - You have pledged to save the planet, you're now a part of the Koywe forest - 🌳🌳
        <p>Move on to step 3: the Forest</p>
      </div>
    );
  }

  let pledgeButton = (
    <div style={{ padding: 8, marginTop: 32, width: 300, margin: "auto" }}>
      <Input
        style={{ textAlign: "center" }}
        placeholder={"annual CO2e tons committed"}
        value={tonsCommitted}
        onChange={e => {
          setTonsCommitted(e.target.value);
        }}
      />
      <Button
        type={pledged ? "success" : "primary"}
        size={"large"}
        loading={pledging}
        onClick={async () => {
          setPledging(true);
          await tx(writeContracts.KoywePledge.newPledge(tonsCommitted));
          setPledging(false);
        }}
      >
        🌱 Pledge On-Chain 🌱
      </Button>
    </div>
  );
  
  if (pledged){
    pledgeButton = (
      <div>
        <p>You are now a part of something bigger: a forest.</p>
        <Link
          onClick={() => {
            setRoute("/journey");
          }}
          to="/journey"
        >
          <Button
            size={"large"}
            onClick={() => {
              setRoute("/journey");
            }}
          >
            🌱 Grow the Forest 🌱
          </Button>
        </Link>
    </div>);
  };

  const millisToDate = function(milliseconds) {
    const date = new Date(milliseconds);
    return date.toString();
  };

  /*
  const addressFromENS = useResolveName(mainnetProvider, "austingriffith.eth");
  console.log("🏷 Resolved austingriffith.eth as:", addressFromENS)
  */

  //
  // 🧫 DEBUG 👨🏻‍🔬
  //
  useEffect(() => {
    if (
      DEBUG &&
      mainnetProvider &&
      address &&
      selectedChainId &&
      yourLocalBalance &&
      yourMainnetBalance &&
      yourMaticBalance &&
      readContracts &&
      writeContracts &&
      polyContracts &&
      mainnetContracts
    ) {
      console.log("_____________________________________ 🏗 scaffold-eth _____________________________________");
      console.log("🌎 mainnetProvider", mainnetProvider);
      console.log("🌎 polyProvider", polyProvider);
      console.log("🏠 localChainId", localChainId);
      console.log("👩‍💼 selected address:", address);
      console.log("🕵🏻‍♂️ selectedChainId:", selectedChainId);
      console.log("💵 yourLocalBalance", yourLocalBalance ? ethers.utils.formatEther(yourLocalBalance) : "...");
      console.log("💵 yourMainnetBalance", yourMainnetBalance ? ethers.utils.formatEther(yourMainnetBalance) : "...");
      console.log("💵 yourMaticBalance", yourMaticBalance ? ethers.utils.formatEther(yourMaticBalance) : "...");
      console.log("📝 readContracts", readContracts);
      console.log("📝 polyContracts", polyContracts);
      console.log("🌍 DAI contract on mainnet:", mainnetContracts);
      console.log("💵 yourMainnetDAIBalance", myMainnetDAIBalance ? ethers.utils.formatEther(myMainnetDAIBalance) : "...");
      console.log("💵 yourPolyMCO2Balance", myPolyMCO2Balance ? ethers.utils.formatEther(myPolyMCO2Balance) : "...");
      console.log("💵 yourPolyBCTBalance", myPolyBCTBalance ? ethers.utils.formatEther(myPolyBCTBalance) : "...");
      console.log("🔐 writeContracts", writeContracts);
    }
  }, [
    mainnetProvider,
    address,
    selectedChainId,
    yourLocalBalance,
    yourMainnetBalance,
    readContracts,
    writeContracts,
    mainnetContracts,
  ]);

  let networkDisplay = "";
  if (NETWORKCHECK && localChainId && selectedChainId && localChainId !== selectedChainId) {
    const networkSelected = NETWORK(selectedChainId);
    const networkLocal = NETWORK(localChainId);
    if (selectedChainId === 1337 && localChainId === 31337) {
      networkDisplay = (
        <div style={{ zIndex: 2, position: "absolute", right: 0, top: 60, padding: 16 }}>
          <Alert
            message="⚠️ Wrong Network ID"
            description={
              <div>
                You have <b>chain id 1337</b> for localhost and you need to change it to <b>31337</b> to work with
                HardHat.
                <div>(MetaMask -&gt; Settings -&gt; Networks -&gt; Chain ID -&gt; 31337)</div>
              </div>
            }
            type="error"
            closable={false}
          />
        </div>
      );
    } else {
      networkDisplay = (
        <div style={{ zIndex: 2, position: "absolute", right: 0, top: 60, padding: 16 }}>
          <Alert
            message="⚠️ Wrong Network"
            description={
              <div>
                You have <b>{networkSelected && networkSelected.name}</b> selected and you need to be on{" "}
                <Button
                  onClick={async () => {
                    const ethereum = window.ethereum;
                    const data = [
                      {
                        chainId: "0x" + targetNetwork.chainId.toString(16),
                        chainName: targetNetwork.name,
                        nativeCurrency: targetNetwork.nativeCurrency,
                        rpcUrls: [targetNetwork.rpcUrl],
                        blockExplorerUrls: [targetNetwork.blockExplorer],
                      },
                    ];
                    console.log("data", data);

                    let switchTx;
                    // https://docs.metamask.io/guide/rpc-api.html#other-rpc-methods
                    try {
                      switchTx = await ethereum.request({
                        method: "wallet_switchEthereumChain",
                        params: [{ chainId: data[0].chainId }],
                      });
                    } catch (switchError) {
                      // not checking specific error code, because maybe we're not using MetaMask
                      try {
                        switchTx = await ethereum.request({
                          method: "wallet_addEthereumChain",
                          params: data,
                        });
                      } catch (addError) {
                        // handle "add" error
                      }
                    }

                    if (switchTx) {
                      console.log(switchTx);
                    }
                  }}
                >
                  <b>{networkLocal && networkLocal.name}</b>
                </Button>
              </div>
            }
            type="error"
            closable={false}
          />
        </div>
      );
    }
  } else {
    networkDisplay = (
      <div style={{ zIndex: -1, position: "absolute", right: 154, top: 28, padding: 16, color: targetNetwork.color }}>
        {targetNetwork.name}
      </div>
    );
  }

  let pledgeBanner = "";
  if(pledged){
    pledgeBanner = (
      <div style={{ zIndex: -1, position: "absolute", right: 300, top: 32, padding: 16, color: targetNetwork.color }}>
          🌳  PLEDGED 🌳
      </div>
    );
  }

  let dripBalance = "";
  if(pledged){
    if(CO2TokenBalance == 0){
      dripBalance = (
        <Button
          type={CO2TokenBalance > 0 ? "success" : "primary"}
          size={"large"}
          loading={dripping}
          onClick={async () => {
            setDripping(true);
            await tx(writeContracts.CO2TokenContract.startDripping(address));
            setDripping(false);
          }}
        >
          💧 Start Dripping your CO2e 💧
        </Button>
      );
    } else{
      dripBalance = (
        <div style={{ padding: 8, marginTop: 32, width: 300, margin: "auto" }}>
          <Card title="🔥 Your CO2e Tons🔥" >
            <div style={{ padding: 8 }}>
              <Balance balance={CO2TokenBalance} fontSize={64} /> CO2e Tons emitted since pledging; the share of the problem you own
            </div>
          </Card>
        </div>
      );
    }
  }

  const loadWeb3Modal = useCallback(async () => {
    const provider = await web3Modal.connect();
    setInjectedProvider(new ethers.providers.Web3Provider(provider));

    provider.on("chainChanged", chainId => {
      console.log(`chain changed to ${chainId}! updating providers`);
      setInjectedProvider(new ethers.providers.Web3Provider(provider));
    });

    provider.on("accountsChanged", () => {
      console.log(`account changed!`);
      setInjectedProvider(new ethers.providers.Web3Provider(provider));
    });

    // Subscribe to session disconnection
    provider.on("disconnect", (code, reason) => {
      console.log(code, reason);
      logoutOfWeb3Modal();
    });
  }, [setInjectedProvider]);

  useEffect(() => {
    if (web3Modal.cachedProvider) {
      loadWeb3Modal();
    }
  }, [loadWeb3Modal]);

  const [route, setRoute] = useState();
  useEffect(() => {
    setRoute(window.location.pathname);
  }, [setRoute]);

  let faucetHint = "";
  const faucetAvailable = localProvider && localProvider.connection && targetNetwork.name.indexOf("local") !== -1;

  const [faucetClicked, setFaucetClicked] = useState(false);
  if (
    !faucetClicked &&
    localProvider &&
    localProvider._network &&
    localProvider._network.chainId === 31337 &&
    yourLocalBalance &&
    ethers.utils.formatEther(yourLocalBalance) <= 0
  ) {
    faucetHint = (
      <div style={{ padding: 16 }}>
        <Button
          type="primary"
          onClick={() => {
            faucetTx({
              to: address,
              value: ethers.utils.parseEther("0.01"),
            });
            setFaucetClicked(true);
          }}
        >
          💰 Grab funds from the faucet ⛽️
        </Button>
      </div>
    );
  }

  const [tokenBuyAmount, setTokenBuyAmount] = useState();
  const ethCostToPurchaseTokens =
    tokenBuyAmount && tokensPerEth && ethers.utils.parseEther("" + tokenBuyAmount / parseFloat(tokensPerEth));
  console.log("ethCostToPurchaseTokens:", ethCostToPurchaseTokens);

  const [buying, setBuying] = useState();

  const buyTokensEvents = useEventListener(readContracts, "KoyweVendor", "BuyTokens", localProvider, 1);

  const { Step } = Steps;

  const tokenColumns = [
    {
      title: 'Token',
      dataIndex: 'name',
    },
    {
      title: 'Holding',
      dataIndex: 'hold',
    },
    {
      title: 'CO2 Value (Tons)',
      dataIndex: 'co2',
    },
    {
      title: 'Description',
      dataIndex: 'desc',
    },
    
  ];
  
  const tokenData = [
    {
      key: '1',
      name: 'Moss CO2 Token (MCO2)',
      hold: <TokenBalance 
              contracts = {polyContracts}
              name = {"PMCO2"}
              address = {address}
              dollarMultiplier = {7.32}
            />,
      desc: 'Moss Certified CO2 Token',
      co2: <TokenBalance 
              contracts = {polyContracts}
              name = {"PMCO2"}
              address = {address}
            />,
    },
    {
      key: '2',
      name: 'Toucan CO2 Tokens (BCT)',
      hold: <TokenBalance 
              contracts = {polyContracts}
              name = {"PBCT"}
              address = {address}
              dollarMultiplier = {6.23}
            />,
      desc: 'Toucan vera standard credits bridged to blockchain.',
      co2: <TokenBalance 
              contracts = {polyContracts}
              name = {"PBCT"}
              address = {address}
            />,
    },
    {
      key: '3',
      name: 'Koywe CO2 Tokens (KOY)',
      hold: <TokenBalance 
              contracts = {readContracts}
              name = {"KoyweToken"}
              address = {address}
              dollarMultiplier = {7}
            />,
      desc: 'Koywe certified CO2 Tokens.',
      co2: <TokenBalance 
              contracts = {readContracts}
              name = {"KoyweToken"}
              address = {address}
            />,
    },
  ];

  const chartData = {
    labels: ['Plight', 'Fight'],
    datasets: [
      {
        label: 'CO2 tons',
        data: [tonsPledged > 0 ? (CO2TokenBalance/Math.pow(10,18)).toFixed(2) : 0,
          (
            (myPolyBCTBalance && myPolyBCTBalance > 0 ? myPolyBCTBalance : 0)/(Math.pow(10,18))
          + (myPolyMCO2Balance && myPolyMCO2Balance > 0 ? myPolyMCO2Balance : 0)/(Math.pow(10,18))
          + (koyweTokenBalance && koyweTokenBalance > 0 ? koyweTokenBalance : 0)/(Math.pow(10,18))
          ).toFixed(2)
          ],
        backgroundColor: [
          'rgba(255, 99, 132, 0.2)',
          'rgba(75, 192, 192, 0.2)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(75, 192, 192, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="App">
      {/* ✏️ Edit the header and change the title to your project name */}
      <Header />
      {pledgeBanner}
      {networkDisplay}
      <BrowserRouter>
        <Menu style={{ textAlign: "center" }} selectedKeys={[route]} mode="horizontal">
        <Menu.Item key="/">
            <Link
              onClick={() => {
                setRoute("/");
              }}
              to="/"
            >
              Dashboard
            </Link>
          </Menu.Item>
          <Menu.Item key="/rart">
            <Link
              onClick={() => {
                setRoute("/rart");
              }}
              to="/rart"
            >
              Regen Art
            </Link>
          </Menu.Item>
          <Menu.Item key="/refi">
            <Link
              onClick={() => {
                setRoute("/refi");
              }}
              to="/refi"
            >
              Regen Defi
            </Link>
          </Menu.Item>
          {/* <Menu.Item key="/debug">
            <Link
              onClick={() => {
                setRoute("/debug");
              }}
              to="/debug"
            >
              Debug
            </Link>
          </Menu.Item> */}
        </Menu>

        <Switch>
          <Route exact path="/">
            <div >
              <Space>
                
                <Card title="Your Fight" style={{ width: 400, textAlign: "left" }}>
                  <p>🌳 0 trees planted</p>
                  <p>💨 {((myPolyBCTBalance && myPolyBCTBalance > 0 ? myPolyBCTBalance : 0)/(Math.pow(10,18)) + (myPolyMCO2Balance && myPolyMCO2Balance > 0 ? myPolyMCO2Balance : 0)/(Math.pow(10,18)) + (koyweTokenBalance && koyweTokenBalance > 0 ? koyweTokenBalance : 0)/(Math.pow(10,18)) ).toFixed(2)} CO2e tons secuestered</p>
                  <h2>🤑 {((myPolyBCTBalance && myPolyBCTBalance > 0 ? myPolyBCTBalance : 0)/(Math.pow(10,18))*7.32 + (myPolyMCO2Balance && myPolyMCO2Balance > 0 ? myPolyMCO2Balance : 0)/(Math.pow(10,18))*6.23 + (koyweTokenBalance && koyweTokenBalance > 0 ? koyweTokenBalance : 0)/(Math.pow(10,18))*7 ).toFixed(2)} USD invested</h2>
                </Card>
                <Card title="Your Plight" style={{ width: 400, textAlign: "right" }}>
                  <p>🏭 1.5 CO2e tons in transactions</p>
                  <p>{tonsPledged > 0 ? "🩸 "+(CO2TokenBalance/Math.pow(10,18)).toFixed(2)+" CO2e tons dripped" : "🤐 Start dripping CO2 tokens."}</p>
                  <h2>{tonsPledged > 0 ? "🤞 "+tonsPledged.toString()+" CO2e tons/year pledged" : "🤐 Take the pledge to own your share of the problem."}</h2>
                </Card>
                
              </Space>
              <div style={{ width: 400, margin: "auto"}}>
                <Doughnut data={chartData} />
              </div>
              <h2>Your ReFi Positions</h2>
              <div style={{ width: 900, margin: "auto"}}>
                <Table columns={tokenColumns} dataSource={tokenData} />
              </div>
              <Link
                onClick={() => {
                  setRoute("/refi");
                }}
                to="/refi"
              >
                <Button
                  size={"large"}
                  onClick={() => {
                    setRoute("/refi");
                  }}
                >
                  🌱 Put your money where your mouth is 🤑  Buy more! 🌱
                </Button>
              </Link>
            </div>
          </Route>
          <Route exact path="/pledge">
            {pledgeDisplay}
            <div >
              <div style={{ width: 500, margin: "auto"}}>
                <h1 style={{ padding: 8, marginTop: 32 }}>First... The Pledge</h1>
                <p>This pledge is nothing more than a public commitment to do better. To be in charge of our emissions. To take ownership of a part of the effort.</p>
                <p>It doesn't need to be exact, but it does need to come from the heart.</p>
                <p>There are 60 million CO2e tons emitted every year.</p>
                <p>We ask you to make a commitment, just like our nation's leaders do, of annual CO2 tons that we will contribute to bring to zero (0).</p>
                <Divider/>
                <p>🌎 🌍 I hereby pledge to do my best to save the planet.</p>
                <p>🏬 🍔 I pledge to do my best to reduce emissions, by consuming less or by being more conscious about my decisions.</p>
                <p>👭 👬 I pledge to help others in their paths to help the planet.</p>
                <p>🤑 ⌛ I pledge to contribute, with money or time as long as I am able, to other people in my community.</p>
                <p>📝 🪧 I pledge to reduce or offset {tonsPledged > 0 ? tonsPledged.toString() : tonsCommitted} CO2e tons per year.</p>
                <h2>🌳 🌳 I pledge to grow a Forest, to be a Forest with my community, to take small, steady, and concrete steps to protect and help everyone adapt to the stormy weather 🌳 🌳</h2>
              </div>
              {pledgeButton}
              
              <Steps size="small" current={0}>
                <Step title="Pledge" />
                <Step title="Forest" />
              </Steps>
            </div>

          </Route>
          <Route exact path="/journey">

            <h1 style={{ padding: 8, marginTop: 32 }}>🌱🌿🪴🌳 Our Journey starts <b>here</b>🌳🪴🌿🌱</h1>
            {dripBalance}
            <h1 style={{ padding: 8, marginTop: 32 }}>You are not alone</h1>
            <h2>We are a Forest, the Koywe Forest</h2>
            <p>A group of committed individuals taking action, TODAY.</p>
            <p>Because words without actions are just wind, let's explore actionable steps to fight climate change, together...</p>
            <p>Start by investing in sustainable web3 projects.</p>

            <div style={{ width: 500, margin: "auto", marginTop: 64 }}>
              <div>Koywe Pledges:</div>
              <List
                dataSource={pledgeEvents}
                renderItem={item => {
                  return (
                    <List.Item key={item.blockNumber}>
                      <Address value={item.args[0]} ensProvider={mainnetProvider} fontSize={16} /> committed
                      &nbsp;{item.args[1].toString()} CO2e annual tons on {millisToDate(item.args[2].toNumber()*1000)}
                    </List.Item>
                  );
                }}
              />
            </div>

            <Steps size="small" current={2}>
                <Step title="Pledge" />
                <Step title="Forest" />
            </Steps>

          </Route>
          <Route path="/refi">
            <Swap selectedProvider={mainnetProvider} address={address}/>
            <Space>
              <div style={{ padding: 8 }}>
                <div>Available Supply to Buy:</div>
                <Balance balance={vendorTokenBalance} fontSize={64} />
              </div>
            </Space>
            <div style={{ padding: 8 }}>{tokensPerEth && tokensPerEth.toNumber()} tokens per ETH</div>
            <Space>
              <div style={{ padding: 8, marginTop: 32, width: 300, margin: "auto" }}>
                <Card title="Buy Tokens" >
                  

                  <div style={{ padding: 8 }}>
                    <Input
                      style={{ textAlign: "center" }}
                      placeholder={"amount of tokens to buy"}
                      value={tokenBuyAmount}
                      onChange={e => {
                        setTokenBuyAmount(e.target.value);
                      }}
                    />
                    <Balance balance={ethCostToPurchaseTokens} dollarMultiplier={price} />
                  </div>

                  <div style={{ padding: 8 }}>
                    <Button
                      type={"primary"}
                      loading={buying}
                      onClick={async () => {
                        setBuying(true);
                        await tx(writeContracts.KoyweVendor.buyTokens({ value: ethCostToPurchaseTokens }));
                        setBuying(false);
                      }}
                    >
                      Buy Tokens
                    </Button>
                  </div>
                </Card>
              </div>
            </Space>
          </Route>
          <Route path="/debug">
            <Contract
              name="KoywePledge"
              signer={userSigner}
              provider={localProvider}
              address={address}
              blockExplorer={blockExplorer}
              contractConfig={contractConfig}
            />
            <Contract
              name="CO2TokenContract"
              signer={userSigner}
              provider={localProvider}
              address={address}
              blockExplorer={blockExplorer}
              contractConfig={contractConfig}
            />
            <Contract
              name="KoyweToken"
              signer={userSigner}
              provider={localProvider}
              address={address}
              blockExplorer={blockExplorer}
              contractConfig={contractConfig}
            />
            <Contract
              name="KoyweVendor"
              signer={userSigner}
              provider={localProvider}
              address={address}
              blockExplorer={blockExplorer}
              contractConfig={contractConfig}
            />
          </Route>
        </Switch>
      

      <ThemeSwitch />

      {/* 👨‍💼 Your account is in the top right with a wallet at connect options */}
      <div style={{ position: "fixed", textAlign: "right", right: 0, top: 0, padding: 10 }}>
        <Account
          address={address}
          localProvider={localProvider}
          userSigner={userSigner}
          mainnetProvider={mainnetProvider}
          price={price}
          web3Modal={web3Modal}
          loadWeb3Modal={loadWeb3Modal}
          logoutOfWeb3Modal={logoutOfWeb3Modal}
          blockExplorer={blockExplorer}
        />
        <DropdownMenu setRoute = {setRoute} />
        {faucetHint}
      </div>

      </BrowserRouter>
      <div style={{ marginTop: 32, opacity: 0.5 }}>
        {/* Add your address here */}
        Created by <Address value={"acuna.eth"} ensProvider={mainnetProvider} fontSize={16} />
      </div>

      <div style={{ marginTop: 32, opacity: 0.5 }}>
        <a target="_blank" style={{ padding: 32, color: "#000" }} href="https://github.com/scaffold-eth/scaffold-eth">
          🍴 Fork me!
        </a>
      </div>

      {/* 🗺 Extra UI like gas price, eth price, faucet, and support: */}
      <div style={{ position: "fixed", textAlign: "left", left: 0, bottom: 20, padding: 10 }}>
        <Row align="middle" gutter={[4, 4]}>
          <Col span={8}>
            <Ramp price={price} address={address} networks={NETWORKS} />
          </Col>

          <Col span={8} style={{ textAlign: "center", opacity: 0.8 }}>
            <GasGauge gasPrice={gasPrice} />
          </Col>
          <Col span={8} style={{ textAlign: "center", opacity: 1 }}>
            <Button
              onClick={() => {
                window.open("https://t.me/joinchat/KByvmRe5wkR-8F_zz6AjpA");
              }}
              size="large"
              shape="round"
            >
              <span style={{ marginRight: 8 }} role="img" aria-label="support">
                💬
              </span>
              Support
            </Button>
          </Col>
        </Row>

        <Row align="middle" gutter={[4, 4]}>
          <Col span={24}>
            {
              /*  if the local provider has a signer, let's show the faucet:  */
              faucetAvailable ? (
                <Faucet localProvider={localProvider} price={price} ensProvider={mainnetProvider} />
              ) : (
                ""
              )
            }
          </Col>
        </Row>
      </div>
    </div>
  );
}

export default App;
