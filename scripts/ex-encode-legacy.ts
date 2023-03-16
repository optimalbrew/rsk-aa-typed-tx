import { BigNumber } from "ethers";
import { ethers } from "hardhat";
import { Signer } from "../build/src";
import { UnsignedTransaction, Transaction, serialize, parse } from "./localEthersTrans";
import { TransactionRequest } from "@ethersproject/abstract-provider";

async function main() {

    //grab a couple of signers
    const [user0, user1] = await ethers.getSigners();
 
    //on hardhat the RSK user has no balance
    const rskUser = "0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826";
    console.log("Rsk user initial balance: " + await ethers.provider.getBalance(rskUser));
  
    let fundRskSender = await newUnsignedLegacyTx(rskUser, user0.address, 55_000_000_000_000);

    await user0.sendTransaction(fundRskSender);

    console.log("Rsk user balance post transfer is: " + await ethers.provider.getBalance(rskUser));



    let tx: UnsignedTransaction;

    tx = {
        ///...tx,`
        to: (await user1.getAddress()),
        //from: (await user0.getAddress()),
        chainId: (await ethers.provider.getNetwork()).chainId,
        nonce: await ethers.provider.getTransactionCount(user1.getAddress()),
        //type: 3, //<0x7f, using 1, which can conflict with eip2920 Todo(shree) change later
        value: 1,
        data: '0x',
        gasPrice: 875000000, //1 for RSK
        gasLimit: 40000, 
    };

    //tx.gasPrice = await ethers.provider.getGasPrice(); 
    if ( tx.gasLimit == undefined) {
        tx.gasLimit = await ethers.provider.estimateGas(tx); //warning, but works
    }
    console.log("The unsigned transaction object", tx);
    let serialized = serialize(tx);

    console.log("The serialized tx: \n", serialized);

    let txParsed = parse(serialized);
    console.log("parsed legacy tx ", txParsed);


    //transaction hash (already present iabove, but just for kicks)
    // see https://github.com/ethers-io/ethers.js/issues/1229
    const txHash = ethers.utils.keccak256(serialized);
    console.log("the computed hash is: ", txHash);  //same as above

    //send the TX (automatic signing)
    const sender = new ethers.Wallet("c85ef7d79691fe79573b1a7064c19c1a9819ebdbd1faaab1a8ec92344438aaf4", ethers.provider);

    console.log("The sender is:" +  sender.address +  " with balance: " + (await sender.getBalance()));
    
    const walletSend =  await (await sender.sendTransaction(tx)).wait();  // warning for unsigned type not assignale but works
    
    console.log(walletSend);
   
    // try to send with manual signing and send raw data
    // repeat above but using wallet instead of signers returned.
    
    let tx2: UnsignedTransaction;
    tx2 = {
        ///...tx,`
        to: (await user1.getAddress()), 
        //from: (await user0.getAddress()),
        chainId: (await ethers.provider.getNetwork()).chainId,
        nonce: await ethers.provider.getTransactionCount(sender.getAddress()),
        //type: 3, //<0x7f, using 1, which can conflict with eip2920 Todo(shree) change later
        value: BigNumber.from(1),
        data: '0x',
        gasPrice: BigNumber.from(875000000), //1 for rsk
        gasLimit: BigNumber.from(40000), 
    };

    //tx.gasPrice = await ethers.provider.getGasPrice(); 
    if ( tx2.gasLimit == undefined) {
        tx2.gasLimit = await ethers.provider.estimateGas(tx2); //warning, but works
    }

    let serialized2 = serialize(tx2);

    console.log("The serialized tx2: \n", serialized2);

    let txParsed2 = parse(serialized2);
    console.log("parsed legacy tx2 ", txParsed2);


    //transaction hash (already present iabove, but just for kicks)
    // see https://github.com/ethers-io/ethers.js/issues/1229
    const txHash2 = ethers.utils.keccak256(serialized2);
    console.log("the computed hash is: ", txHash2);  //same as above

    //https://ethereum.stackexchange.com/questions/85212/signing-a-request-with-a-signature-gives-the-wrong-from-address
    const msgSign = await sender.signMessage(txHash2); //leads to weird address for ec recover sender later (does not exist)
    console.log(msgSign + "\n");

    const txSign = await sender.signTransaction(tx2);  
    console.log(txSign + "\n");
    //serialized signed TX
    

    serialized2 = serialize(tx2, msgSign);
    console.log("The signed serialized tx2: \n", serialized2);

    txParsed = parse(serialized2);
    console.log("parsed signed legacy tx ", txParsed); 

    console.log("check if sender address matches tx from: ",  sender.address === txParsed.from);

    //try sign TX instead of sign message


    // //send the TX
    // const sendRawTx = await (await ethers.provider.send("eth_sendRawTransaction", [serialized])).wait();
    // console.log("the response from send Raw", sendRawTx);

        //now the other way
    /** // won't work because hardhat sender does not exist in RSKJ 
     * curl http://localhost:4444     \
     * -X POST -H "Content-Type: application/json"     \
     * --data '{"jsonrpc":"2.0","method":"eth_sendRawTransaction","params":["0xf85f8001829c409470997970c51812dc3a010c7d01b50e0d17dc79c8018065a0a34daffb436dffe00dd6e32c3fbf5b490fe487f4ff1c485952cba35de87576e7a0719f83f72a24b3dc1b5afdb10115f3ae08577f7c9ff8a7d0ae8c55e81790008c"],"id":1}'
     */
    
    /// chainId will determine gasPrice, 900M for hardhat, 1 for RSK regtest
    async function newUnsignedLegacyTx(to: string, from: string, value: number): Promise<TransactionRequest>  {
        const chainId = (await ethers.provider.getNetwork()).chainId 

        let tx: TransactionRequest;
        tx = {
            to: to, 
            //from: (await user0.getAddress()),
            chainId: chainId,
            nonce: await ethers.provider.getTransactionCount(from),
            //type: 3, //<0x7f, using 1, which can conflict with eip2920 Todo(shree) change later
            value: value,
            data: '0x',
            //gasPrice: BigNumber.from(875000000), //1 for rsk
            gasLimit: BigNumber.from(40000), 
        };
        tx.gasPrice = chainId===31337? 900_000_000 : 1
        return tx;
    };

    /** The TransactionRequest Object has these fields     
    export type TransactionRequest = {
        to?: string,
        from?: string,
        nonce?: BigNumberish,

        gasLimit?: BigNumberish,
        gasPrice?: BigNumberish,

        data?: BytesLike,
        value?: BigNumberish,
        chainId?: number

        type?: number;
        accessList?: AccessListish;

        maxPriorityFeePerGas?: BigNumberish;
        maxFeePerGas?: BigNumberish;

        customData?: Record<string, any>;
        ccipReadEnabled?: boolean;
    } 
    */
    
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });