// deploy/01_deploy_koywepledge.js

// const { ethers } = require("hardhat");

module.exports = async ({ getNamedAccounts, deployments, getChainId }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = await getChainId();

  await deploy("KoywePledge", {
    // Learn more about args here: https://www.npmjs.com/package/hardhat-deploy#deploymentsdeploy
    from: deployer,
    //args: [CO2TokenContract.address],
    log: true,
  });

  const koywePledge = await ethers.getContract("KoywePledge", deployer);

  // ToDo: change address to your frontend address vvvv
  // console.log("\n 🤹  Sending ownership to frontend address...\n")
  // const ownershipTransaction = await koywePledge.transferOwnership("0x40f9bf922c23c43acdad71Ab4425280C0ffBD697" );
  // console.log("\n    ✅ confirming...\n");
  // const ownershipResult = await ownershipTransaction.wait();

  // const yourContract = await ethers.getContractAt('YourContract', "0xaAC799eC2d00C013f1F11c37E654e59B0429DF6A") //<-- if you want to instantiate a version of a contract at a specific address!

  // If you want to send value to an address from the deployer
  // const deployerWallet = ethers.provider.getSigner()
  // await deployerWallet.sendTransaction({
  //   to: "0x34aA3F359A9D614239015126635CE7732c18fDF3",
  //   value: ethers.utils.parseEther("0.001")
  // })

  // If you want to send some ETH to a contract on deploy (make your constructor payable!)
  // const yourContract = await deploy("YourContract", [], {
  // value: ethers.utils.parseEther("0.05")
  // });

  // If you want to link a library into your contract:
  // reference: https://github.com/austintgriffith/scaffold-eth/blob/using-libraries-example/packages/hardhat/scripts/deploy.js#L19
  // const yourContract = await deploy("YourContract", [], {}, {
  //  LibraryName: **LibraryAddress**
  // });

  // todo: uncomment to verify your contract
  // if (chainId !== "31337") {
  //   try {
  //     console.log(" 🎫 Verifing Contract on Etherscan... ");
  //     await sleep(3000); // wait 3 seconds for deployment to propagate bytecode
  //      await run("verify:verify", {
  //        address: KoywePledge.address,
  //        contract: "contracts/KoywePledge.sol:KoywePledge",
  //        contractArguments: [],
  //      });
  //   } catch (e) {
  //     console.log(" ⚠️ Failed to verify contract on Etherscan ");
  //   }
  // }
};

module.exports.tags = ["KoywePledge"];
