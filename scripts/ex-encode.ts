import { ethers } from "hardhat";
import { UnsignedTransaction, serialize, parse } from "./localEthersTrans";
import { TransactionRequest } from '@ethersproject/providers';
import { getContractAddress} from "@ethersproject/address";
import * as fs from 'fs';
import { join } from 'path';
import { BigNumber } from "ethers";

/**adding fields to transaction does not work. we get serialization errors. */

async function main() {
    console.log('Start.');

    const [user0, user1] = await ethers.getSigners();
    // const bal0 = await user0.getBalance();
    // const bal1 = await user1.getBalance();
    // console.log('user0', bal0);
    // console.log('user1', bal1);

    // for methods that require explicit signature (e.g. signTransaction), need a signer with pvt key
    //send installcode tx from this account
    const senderKey0 = pvtKeyfromSeed("cow");
    const rskUser0 = new ethers.Wallet(senderKey0, ethers.provider);
    console.log("user0: ", rskUser0.address); //should match user1

    //but install into this account to avoid nonce error
    const senderKey1 = pvtKeyfromSeed("cow1");
    const rskUser1 = new ethers.Wallet(senderKey1, ethers.provider);
    console.log("user1: :", rskUser1.address); //should match user1

    
    ///////////////////////////////////////////////////////////////////////////////////////////////////
    console.log("Install Bar.sol in user-0's EOA address using install code. Test by calling a simple method");
    console.log("To avoid nonce error, send install code TX from user-1 account");
    // the same Bar.sol contract for testing if installcode is actually callable
    const bytecode = fs.readFileSync(join(__dirname, './barDeployedCode.txt'), 'utf-8');
    //same as above, just pasted directly
    //const bytecode2 = "60806040526004361060305760003560e01c8063158ef93e146035578063251c1aa3146062578063c19d93fb146083575b600080fd5b348015604057600080fd5b50600154604d9060ff1681565b60405190151581526020015b60405180910390f35b348015606d57600080fd5b50607660005481565b6040519081526020016059565b600054607656fea26469706673582212207fdf6a17e49468e2ed8a66abff9362d3dbc180c4c49143131355cf2112bcd81864736f6c634300080a0033";
    
    /// The wallet bytecode we actually want to install
    //const bytecode = fs.readFileSync(join(__dirname, './wallet.bytecode'), 'utf-8');
    
    //console.log('bytecode:', bytecode);
    let nonce = ethers.utils.hexZeroPad(
                        ethers.utils.hexlify(
                            await ethers.provider.getTransactionCount(rskUser0.getAddress()) //+ 1 //remove the increment when sending from different account
                        )
                , 32).replace('0x', '');
    let address = ethers.utils.hexZeroPad(
                            (await rskUser0.getAddress())
                , 32).replace('0x', '').toLowerCase();
    let bytecodeHash = ethers.utils.keccak256(ethers.utils.hexlify('0x' + bytecode)).replace('0x', '');
    let msgToSign = '0x' + address + nonce + bytecodeHash;
   // console.log('msgToSign', msgToSign);
    let msgHashToSign = ethers.utils.keccak256(ethers.utils.hexlify( msgToSign ));
    //console.log('msgHashToSign', msgHashToSign);
    
    //to prove ownership, user-0 must sign the message
    let bytecodeSignature = (await rskUser0.signMessage(ethers.utils.arrayify(msgHashToSign))).replace('0x', '');
    //console.log('bytecodeSignature', bytecodeSignature);
    //console.log('v:', '0x' + bytecodeSignature.slice(128));
    let v = ethers.utils.hexZeroPad(
                        ethers.utils.hexlify(
                            '0x' + bytecodeSignature.slice(128)
                        )
                , 32).replace('0x', '');
    bytecodeSignature = v + bytecodeSignature.slice(0, 128);
    //console.log('bytecodeSignature', bytecodeSignature);
    let data = '0x'+address+bytecodeSignature + bytecode;
    //console.log('data', data);
    let txInstall: TransactionRequest = {
        ///...tx,`
        to: '0x0000000000000000000000000000000001000011',
        from: (await rskUser1.getAddress()),
        chainId: (await ethers.provider.getNetwork()).chainId,
        nonce: await ethers.provider.getTransactionCount(rskUser1.getAddress()),
        value: 1,
        data: data,
        gasPrice: 1,
        gasLimit: 2000_000, 
    };
    // if ( txInstall.gasLimit == undefined) {
    //     //txInstall.gasLimit = await ethers.provider.estimateGas(txInstall)
    // }
    let txResult = await (await rskUser1.sendTransaction(txInstall)).wait();
    //console.log("InstallCode result", txResult);
    
    // this is not wallet code, this is Bar.sol deployed via installcode!!
    let ICbarRes = await callBar(user0.address, "state()");
    console.log("\nCall result Installed Code :  ", ICbarRes); //should return 2 in hexstring, but it does not

    console.log("check for code in the account")
    let code = await ethers.provider.getCode(user0.address);
    //check recovered code is the same
    //console.log(code);
    console.log("Verify deployed code is as expected:",code==='0x'+ bytecode);
 



    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /**
     * 
     * Now deploy a regular contract from another account 
     */
    
    //full init code, not just deployed code, this is a regular contract deployment

    const barBytecode = fs.readFileSync(join(__dirname, './barInitCode.txt'), 'utf-8');
    
    let tx: UnsignedTransaction;

    let nonceUser1 = await ethers.provider.getTransactionCount(user1.getAddress());

    tx = {
        ///...tx,`
        //to: , //leave undefined for contract creation
        //from: , // not needed, using default sender
        chainId: (await ethers.provider.getNetwork()).chainId,
        nonce: nonceUser1,
        //type: 3, //<0x7f, using 1, which can conflict with eip2920 Todo(shree) change later
        value: 0,
        data: '0x' + barBytecode,
        gasPrice: 1,
        gasLimit: 2000_000, 
    };

    let deployedAddress = getContractAddress({from: user1.address, nonce: nonceUser1 });
    console.log("\nBar to be deployed at: ", deployedAddress);
    //deploy it
    const sendDeployTx = await user1.sendTransaction(tx);

    // Call it to check it deployed correctly: "initialized()"", "state()"", and "unlockTime()"
    let barRes = await callBar(deployedAddress, "state()");
    console.log("Call result regular contract: ", barRes);

    //console.log("Check the deployed code as before");
    //let code2 = await ethers.provider.getCode(deployedAddress);
    //check recovered code is the same
    //console.log(code2);
    //are both installations identical? why does one behave differently if there is no constructor?
    //console.log(code===code2);

    



    /**
     * Now we try to use the installcode contract to call Bar
     * @param to 
     * @param from 
     * @param value 
     * @param data 
     * @returns 
     */


    // //console.log("the resoonse from send base", sendTx);


    // //now the other way
    // /**
    //  * curl http://localhost:4444     \
    //  * -X POST -H "Content-Type: application/json"     \
    //  * --data '{"jsonrpc":"2.0","method":"eth_sendRawTransaction","params":["0x03f838808504a817c800825208947986b3df570230288501eea3d890bd66948c9b7901802194cd2a3d9f938e13cd947ec05abc7fe734df8dd82680"],"id":1}'
    //  */

    // const getChainId = await ethers.provider.send("eth_chainId",[]);//send("eth_chainID", [])).wait();
    // //console.log("the response from send Raw", getChainId);

    // const sendRawTx = (await ethers.provider.send("eth_sendRawTransaction", [serialized]));

    // console.log("the response from send Raw", sendRawTx);




    // Populate a legacy transaction
    // Use chainId to determine gasPrice, 900M for hardhat, 1 for RSK regtest
    async function newUnsignedLegacyTx(to: string | undefined, from: string, value: number, data?: string): Promise<TransactionRequest>  {
        const chainId = (await ethers.provider.getNetwork()).chainId 

        let tx: TransactionRequest;
        tx = {
            to: to.length < 40? undefined : to, //contract creation has no target address 
            chainId: chainId,
            nonce: await ethers.provider.getTransactionCount(from),
            value: value,
            data: data,
            gasLimit: 2000_000,
        };
        tx.gasPrice = chainId===31337? 900_000_000 : 1
        return tx;
    };

    // populate a new AA 4337 TX Type based on TransactionRequest
    async function newAATx(to: string, from: string, value: number, data: string, customSig: string): Promise<TransactionRequest>  {
        const chainId = (await ethers.provider.getNetwork()).chainId 

        let tx: TransactionRequest;
        tx = {
            to: to, 
            from: from,
            chainId: chainId,
            nonce: await ethers.provider.getTransactionCount(from),
            value: value,
            data: data,
            gasLimit: 2000_000,
            gasPrice: await ethers.provider.getGasPrice(),
            customData: {name:"customSig", customSig},
            type: 3,
        };
        return tx;
    };


    
    
    ///////////////////////////////////////////////////////////////////////////////////////////////////////
    // Some helper functions

    // create account pvt key from string
    // Examples:
    // acc1 => "dd28a0daa33dff4e5635685746483fbfd283511c972976649942d4fa3c6dc3c4"; // used in RSKJ DSL tests
    // cow =>   "c85ef7d79691fe79573b1a7064c19c1a9819ebdbd1faaab1a8ec92344438aaf4"; //default accounts in regtest, cow, cow1, cow2, ...
    function pvtKeyfromSeed(seed: string){
        let seedEncoded =  new TextEncoder().encode(seed);
        return ethers.utils.keccak256(seedEncoded).toString();
    } 

    // Simple legacy TX send transaction as a basic example
    // Creates TX. Signs it using RSK "cow" account pvtKey.  
    async function simpleLegacyTx(rskPvtKey: string, to: string | undefined, value: number, data?: string ) {
        //const [_user0, user1] = await ethers.getSigners(); //on RSKJ regtest user0 is the same cow account below, so use user1
 
        // create a wallet with RSK "cow" account so we can sign with private key 
        const rskUser = new ethers.Wallet(rskPvtKey, ethers.provider);

        const bal = await rskUser.getBalance();
        console.log("The rskUser is:" +  rskUser.address +  " with balance: " + bal);

        if (bal < BigNumber.from(100_000_000_000)){
            //on hardhat network the RSK user has no balance, so fund it for testing  
            let fundRskUserTx = await newUnsignedLegacyTx(rskUser.address, user1.address, 55_000_000_000_000);
            console.log(fundRskUserTx);

            // automatically sign and send legacy transaction to fund rsk user
            await user1.sendTransaction(fundRskUserTx);
            
            // now the RSK user will have balance even on hardhat network
            console.log("Rsk user balance post transfer is: " + await rskUser.getBalance());
        }

        // create a TX to sign, decode, and then decode back (as example, send some money back from Rsk user to user0)
        let newRskTx = await newUnsignedLegacyTx(to, rskUser.address, value, data);

        const signedRskTx = await rskUser.signTransaction(newRskTx);
        console.log("The signed, serialized, legacy TX is" + signedRskTx);

        let txParsed = parse(signedRskTx);
        console.log("The parsed legacy tx is", txParsed);
        
        //send the TX and check the response
        let txResp = await (await rskUser.sendTransaction(newRskTx)).wait();

        return(txResp);
    }

    // call Bar.sol
    // avail function names //two default getters initialized() and "unlockTime()" and one function "state()"
    async function callBar(barAddr: string,  func:string): Promise<string> {
        let funcSel =  ethers.utils.keccak256(ethers.utils.toUtf8Bytes(func)).substring(0,10);
        let tx: UnsignedTransaction;  
     
        tx = {
          to : barAddr,
          value : 0,
          data : funcSel,
          gasPrice : 1,
          gasLimit : 200000,
        }
        return await ethers.provider.call(tx); //use signer for state changing methods
      }

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });