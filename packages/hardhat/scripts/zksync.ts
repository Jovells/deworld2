import { Wallet } from "zksync-web3";
import * as ethers from "ethers";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { Deployer } from "@matterlabs/hardhat-zksync-deploy";

// load env file
import dotenv from "dotenv";
dotenv.config();

// load wallet private key from env file
const PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY || "";

if (!PRIVATE_KEY)
  throw "⛔️ Private key not detected! Add it to the .env file!";

// An example of a deploy script that will deploy and call a simple contract.
export default async function (hre: HardhatRuntimeEnvironment) {
  console.log(`Running deploy script for the Greeter contract`);

  // Initialize the wallet.
  const wallet = new Wallet(PRIVATE_KEY);

  // Create deployer object and load the artifact of the contract you want to deploy.
  const deployer = new Deployer(hre, wallet);
  const artifact = await deployer.loadArtifact("Deworld");

  // Estimate contract deployment fee
  const musdcAddress = "0xff68f7561562C1F24A317d939B46741F76c4Ef55";
  const deploymentFee = await deployer.estimateDeployFee(artifact, [musdcAddress]);

  // ⚠️ OPTIONAL: You can skip this block if your account already has funds in L2
  // Deposit funds to L2
  // const depositHandle = await deployer.zkWallet.deposit({
  //   to: deployer.zkWallet.address,
  //   token: utils.ETH_ADDRESS,
  //   amount: deploymentFee.mul(2),
  // });
  // // Wait until the deposit is processed on zkSync
  // await depositHandle.wait();

  // Deploy this contract. The returned object will be of a `Contract` type, similarly to ones in `ethers`.
  // `greeting` is an argument for contract constructor.
  const parsedFee = ethers.formatEther(deploymentFee.toString());
  console.log(`The deployment is estimated to cost ${parsedFee} ETH`);

  const deworldContract = await deployer.deploy(artifact, [musdcAddress]);

  //obtain the Constructor Arguments
  console.log(
    "constructor args:" + deworldContract.interface.encodeDeploy([musdcAddress]),
  );

  // Show the contract info.
  const contractAddress = deworldContract.address;
  console.log(`${artifact.contractName} was deployed to ${contractAddress}`);

  // Verify contract programmatically
  //
  // Contract MUST be fully qualified name (e.g. path/sourceName:contractName)
  const contractFullyQualifedName = "contracts/utils/Deworld.sol:Deworld";
  const verificationId = await hre.run("verify:verify", {
    address: contractAddress,
    contract: contractFullyQualifedName,
    constructorArguments: [musdcAddress],
    bytecode: artifact.bytecode,
  });
  console.log(
    `${contractFullyQualifedName} verified! VerificationId: ${verificationId}`,
  );
}
