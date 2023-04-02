// TODO: essayer de récuperer un signer de l'account 0 du wallet et l'utiliser pour impersonate un autre compte, qui a plein d'USDT.
// Ensuite, aller sur le contrat de l'USDT et faire un tranfer de l'account de la whale vers un compte de mon wallet.
// De cette façon, je devrais avoir plein d'USDT sur mon compte et je pourrais faire des tests avec.
import { ethers } from "hardhat";
import abi from "./usdtAbi.json";

const usdtAddress = "0xdAC17F958D2ee523a2206206994597C13D831ec7";
const usdtWhaleAddress = "0xee5b5b923ffce93a870b3104b7ca09c3db80047a";

/**
 * We get a whale address full of USDT on mainnet, via Etherscan and zapper.xyz.
 * We fork the mainnet into our local hardhat node, impersonate the whale address, and transfer all the USDT to our first account on local node.
 */
async function main() {
  const [owner] = await ethers.getSigners();
  console.log("owner is ", owner.address);

  const whaleSigner = await ethers.getImpersonatedSigner(usdtWhaleAddress);
  console.log("whaleSigner  is ", whaleSigner);

  // // connect to the contract usdt on the mainnet with ethers.js
  const usdtContract = new ethers.Contract(usdtAddress, abi, owner);

  const usdtBalance = await usdtContract.balanceOf(whaleSigner.address);
  console.log("usdtBalance is ", usdtBalance.toString());
  
  await usdtContract.connect(whaleSigner).transfer(owner.address, usdtBalance);

  const ownerUsdtBalance = await usdtContract.balanceOf(owner.address);
  console.log("ownerUsdtBalance is ", ownerUsdtBalance.toString());
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
