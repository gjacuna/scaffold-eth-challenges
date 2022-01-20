// deploy/00_deploy_example_external_contract.js

const { ethers } = require("hardhat");

module.exports = async ({ getNamedAccounts, deployments, getChainId }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  const chianId = await getChainId();

  const koywePledgeContract = await deployments.get(
    "KoywePledge"
  );

  await deploy("CO2TokenContract", {
    // Learn more about args here: https://www.npmjs.com/package/hardhat-deploy#deploymentsdeploy
    from: deployer,
    args: [koywePledgeContract.address, 0, "CO2e Tons", "TCO2e"],
    log: true,
  });

  const cO2TokenContract = await ethers.getContract("CO2TokenContract");

  // ToDo: change address to your frontend address vvvv
  // console.log("\n 🤹  Sending ownership to frontend address...\n")
  // const ownershipTransaction = await cO2TokenContract.transferOwnership("0x40f9bf922c23c43acdad71Ab4425280C0ffBD697" );
  // console.log("\n    ✅ confirming...\n");
  // const ownershipResult = await ownershipTransaction.wait();

  // Getting a previously deployed contract
  // const CO2TokenContract = await ethers.getContract(
  //   "CO2TokenContract",
  //   deployer
  // );

  // await YourContract.setPurpose("Hello");

  // if you want to instantiate a version of a contract at a specific address!
  // const yourContract = await ethers.getContractAt('YourContract', "0xaAC799eC2d00C013f1F11c37E654e59B0429DF6A")

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

  // todo: verification with etherscan
  // Verification
  // if (chainId !== "31337") {
  //   try {
  //     console.log(" 🎫 Verifing Contract on Etherscan... ");
  //     await sleep(5000); // wait 5 seconds for deployment to propagate
  //     await run("verify:verify", {
  //       address: CO2TokenContract.address,
  //       contract:
  //         "contracts/CO2TokenContract.sol:CO2TokenContract",
  //       contractArguments: [],
  //     });
  //   } catch (error) {
  //     console.log("⚠️ Contract Verification Failed: ", error);
  //   }
  // }
};

// function sleep(ms) {
//   return new Promise((resolve) => setTimeout(resolve, ms));
// }

module.exports.tags = ["CO2TokenContract"];
