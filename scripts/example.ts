import { EIP712Signer } from "../src/signer";
import { TransactionRequest, Eip712Meta } from "../src/types"
import { ethers } from "hardhat";
//import { Wallet } from "ethers";

async function main() {
    let tx: TransactionRequest;  //or just use ethers.Provider.TransactionRequest;
    const [user0, user1] = await ethers.getSigners();
    tx = {
        ///...tx,
        to: (await user1.getAddress()),
        from: (await user0.getAddress()),
        chainId: (await ethers.provider.getNetwork()).chainId,
        nonce: await ethers.provider.getTransactionCount(user0.getAddress()),
        type: 113, //0x71
        // customData: {
        //   customSignature: undefined,
        // } as Eip712Meta,
        value: 1,
        data:'0x',
      };

    tx.gasPrice = await ethers.provider.getGasPrice(); 
    if ( tx.gasLimit == undefined) {
        tx.gasLimit = await ethers.provider.estimateGas(tx)
    }
    console.log(tx);

    const signInput = EIP712Signer.getSignInput(tx);

    console.log(signInput);

    //signer
    const signer = new EIP712Signer(user0, (await ethers.provider.getNetwork()).chainId);
    const sig = await signer.sign(tx);
    const sigsize = sig.length; 
    
    console.log('The typed data signature is %s and length is %d', sig, (sigsize-2));

    //the digest
    const signedDigest = await EIP712Signer.getSignedDigest(tx);
    console.log('The signed typed data digest is %s with length %d', signedDigest, (signedDigest.length -2));

    //todo ecrecover
    const txResp  = (await (await user0.sendTransaction(tx)).wait());

    console.log(txResp);

    //tx encoding  

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
