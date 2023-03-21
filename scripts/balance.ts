import { ethers } from "hardhat";

/**adding fields to transaction does not work. we get serialization errors. */

async function main() {
    console.log('Start.');

    const [user0, user1] = await ethers.getSigners();
    const bal0 = await user0.getBalance();
    const bal1 = await user1.getBalance();
    console.log('user0',await user0.getAddress(), bal0);
    console.log('user1',await user1.getAddress(), bal1);

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });