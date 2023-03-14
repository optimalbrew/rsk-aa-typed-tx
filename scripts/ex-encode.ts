import { ethers } from "hardhat";
import { UnsignedTransaction, serialize, parse } from "./localEthersTrans";

/**adding fields to transaction does not work. we get serialization errors. */

async function main() {

    const [user0, user1] = await ethers.getSigners();
    //const bal0 = await user0.getBalance();
    //const bal1 = await user1.getBalance();
    
    //console.log("The users balances are", bal0 , bal1);

    let tx: UnsignedTransaction;

    tx = {
        ///...tx,`
        to: (await user1.getAddress()),
        from: (await user0.getAddress()),
        chainId: (await ethers.provider.getNetwork()).chainId,
        nonce: await ethers.provider.getTransactionCount(user0.getAddress()),
        type: 3, //<0x7f, using 1, which can conflict with eip2920 Todo(shree) change later
        value: 1,
        data: '0x',
        gasPrice: 1,
        gasLimit: 40000, 
    };

    //tx.gasPrice = await ethers.provider.getGasPrice(); 
    if ( tx.gasLimit == undefined) {
        tx.gasLimit = await ethers.provider.estimateGas(tx)
    }
    console.log("The unsigned transaction object", tx);
    let serialized = serialize(tx);

    console.log("The serialized tx: \n", serialized);

    let txParsed = parse(serialized);
    console.log("parsed tx with new fields", txParsed);


    //transaction hash (already present iabove, but just for kicks)
    // see https://github.com/ethers-io/ethers.js/issues/1229
    const txHash = ethers.utils.keccak256(serialized);
    console.log("the computed hash is: ", txHash);  //same as above

    //try sending serialized tx -- it is unsigned and should fail.
    // fails because ethers cannot parse it (actual libary unchanged, not patched)
    //const sendTx = await (await ethers.provider.sendTransaction(serialized)).wait();

    //console.log("the resoonse from send base", sendTx);


    //now the other way
    /**
     * curl http://localhost:4444     \
     * -X POST -H "Content-Type: application/json"     \
     * --data '{"jsonrpc":"2.0","method":"eth_sendRawTransaction","params":["0x03f838808504a817c800825208947986b3df570230288501eea3d890bd66948c9b7901802194cd2a3d9f938e13cd947ec05abc7fe734df8dd82680"],"id":1}'
     */

    const getChainId = await ethers.provider.send("eth_chainId",[]);//send("eth_chainID", [])).wait();
    console.log("the response from send Raw", getChainId);

    const sendRawTx = await (await ethers.provider.send("eth_sendRawTransaction", [serialized])).wait();

    console.log("the response from send Raw", sendRawTx);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });