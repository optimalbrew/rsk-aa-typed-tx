import { ethers } from "hardhat";
import { UnsignedTransaction, serialize, parse } from "./localEthersTrans";

/**adding fields to transaction does not work. we get serialization errors. */

async function main() {

    const [user0, user1] = await ethers.getSigners();

    let tx: UnsignedTransaction;

    tx = {
        ///...tx,
        to: (await user1.getAddress()),
        from: (await user0.getAddress()),
        chainId: (await ethers.provider.getNetwork()).chainId,
        nonce: await ethers.provider.getTransactionCount(user0.getAddress()),
        type: 3, //<0x7f
        value: 1,
        data:'0x',
    };

    tx.gasPrice = await ethers.provider.getGasPrice(); 
    if ( tx.gasLimit == undefined) {
        tx.gasLimit = await ethers.provider.estimateGas(tx)
    }
    console.log(tx);
    let serialized = serialize(tx);

    console.log(serialized);

    let txParsed = parse(serialized);
    console.log(txParsed);

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });