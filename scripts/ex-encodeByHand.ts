import { BigNumber } from "ethers";
import { ethers } from "hardhat";

/**adding fields to transaction does not work. we get serialization errors. */

async function main() {

    const [user0, user1] = await ethers.getSigners();

    let tx: ethers.utils.UnsignedTransaction;

    tx = {
        ///...tx,
        to: (await user1.getAddress()),
        //from: (await user0.getAddress()),
        chainId: (await ethers.provider.getNetwork()).chainId,
        nonce: await ethers.provider.getTransactionCount(user0.getAddress()),
        type: 0, //0x71
        value: 1,
        data:'0x',
    };

    tx.gasPrice = await ethers.provider.getGasPrice(); 
    if ( tx.gasLimit == undefined) {
        tx.gasLimit = await ethers.provider.estimateGas(tx)
    }
    console.log(tx);
    let serialized = ethers.utils.serializeTransaction(tx);

    console.log(serialized);

    let txParsed = ethers.utils.parseTransaction(serialized);
    console.log(txParsed);

    /**start another object without using the class */
    let tx1: any;
    tx1 = {
        to: (await user1.getAddress()),
        from: (await user0.getAddress()),
        chainId: (await ethers.provider.getNetwork()).chainId,
        nonce: await ethers.provider.getTransactionCount(user0.getAddress()),
        type: '0x7f', //0x71
        value: BigNumber.from(1),
        data:'0x',
        gaslimit: await ethers.provider.estimateGas(tx),
    };

    console.log(tx1);

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });