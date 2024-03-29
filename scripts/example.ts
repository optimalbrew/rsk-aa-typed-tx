//import { BigNumber } from "ethers";
import { ethers } from "hardhat";
import { parse, serializeTR, encode4337withoutCustomSig } from "./localEthersTrans";
import { TransactionRequest } from "@ethersproject/abstract-provider";
import { getContractAddress} from "@ethersproject/address";
import { splitSignature } from "@ethersproject/bytes";
import { BigNumber } from "ethers";
//import { Wallet } from "../src";
//import { string } from "hardhat/internal/core/params/argumentTypes";
//import { experimentalAddHardhatNetworkMessageTraceHook } from "hardhat/config";

async function main() {
    const [_user0, user1] = await ethers.getSigners(); //on RSKJ regtest user0 is "cow" account, user1 is "cow1"

    //////////////////////////////////////////////////////////////////////////////////////////////////////////
    
    /// 1. A simple legacy send TX
    /// send value from cow account to another
    simpleLegacyTransaction();

    async function simpleLegacyTransaction() {
        let senderPvtKey = pvtKeyfromSeed("acc2");
        let to = user1.address;
        let val = 666;
        let data = '0x';
        
        let txResp = await simpleLegacyTx(senderPvtKey, to, val, data); //on RSKJ send from cow to cow1
        console.log(txResp);
    }
    
    /// 2. Install Code TX (only on RSKJ of course)
    /// use a legacy transaction formal to call installcode precompiled contract
    /// Then deploy a contract and call it from AA (installcode) account
    deployAndCallFromAA();

    async function deployAndCallFromAA() {

        const installCodeCallData = "0x000000000000000000000000a0663f719962ec10bb57865532bef522059dfd96000000000000000000000000000000000000000000000000000000000000001c1a51ea3d88dbc7a4e9fd00807f52c2244c2cd4c8c2e9fbdc7a815518145ab80d054ffa4c1a3c34ae4382bd4d41d98faa7c458c62ea6611f8e0eafb175ab3d39560806040526004361015610018575b361561001657005b005b6000803560e01c9081631626ba7e146100bb5750806332c59bf4146100b257806352709725146100a957806370133bc7146100a05780637368891414610097578063b09b2fdb1461008e578063b8a55e85146100855763c4751d320361000e57610080610261565b61000e565b5061008061045d565b5061008061044b565b506100806103eb565b506100806102a0565b5061008061026b565b50610080610261565b34610133576040600319360112610133576024359067ffffffffffffffff82116101335736602383011215610133576020610109610101366004860135602487016101e0565b600435610e86565b7fffffffff0000000000000000000000000000000000000000000000000000000060405191168152f35b80fd5b50634e487b7160e01b600052604160045260246000fd5b6040810190811067ffffffffffffffff82111761016957604052565b610171610136565b604052565b60c0810190811067ffffffffffffffff82111761016957604052565b90601f601f19910116810190811067ffffffffffffffff82111761016957604052565b601f19601f60209267ffffffffffffffff81116101d3575b01160190565b6101db610136565b6101cd565b9291926101ec826101b5565b916101fa6040519384610192565b829481845281830111610217578281602093846000960137010152565b600080fd5b90816101209103126102175790565b60606003198201126102175760043591602435916044359067ffffffffffffffff82116102175761025e9160040161021c565b90565b506100163661022b565b503461021757600060031936011261021757602073ffffffffffffffffffffffffffffffffffffffff60015416604051908152f35b506102aa3661022b565b9150600090806103d35750813580610348575081630b135d3f60e11b61032f6102f86102d76020966106ed565b935b6102ed6102e582610d7d565b4710156104dc565b61010081019061054d565b9190936103297fffffffff0000000000000000000000000000000000000000000000000000000095869436916101e0565b90610e86565b161461033f575b60405191168152f35b60009150610336565b600381036103695750602091630b135d3f60e11b61032f6102f860006102d7565b60710361038f5781630b135d3f60e11b61032f6102f861038a602096610bad565b6102d7565b606460405162461bcd60e51b815260206004820152601760248201527f456e636f64696e6720756e737570706f727465642074780000000000000000006044820152fd5b91630b135d3f60e11b61032f6102f8602095936102d9565b503461021757600060031936011261021757602073ffffffffffffffffffffffffffffffffffffffff60005416604051908152f35b6020600319820112610217576004359067ffffffffffffffff82116102175761025e9160040161021c565b5061001661045836610420565b610dc6565b5061046736610420565b8035806104a95750806104a361047f610016936106ed565b61048b6102e584610d7d565b61032961049c61010085018561054d565b36916101e0565b50610dc6565b600381036104c05750610016906104a3600061047f565b60710361038f57806104a36104d761001693610bad565b61047f565b156104e357565b608460405162461bcd60e51b815260206004820152602260248201527f4e6f7420656e6f7567682062616c616e636520666f7220666565202b2076616c60448201527f75650000000000000000000000000000000000000000000000000000000000006064820152fd5b9035907fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe181360301821215610217570180359067ffffffffffffffff82116102175760200191813603831361021757565b9081519160005b8381106105b6575050016000815290565b80602080928401015181850152016105a5565b6105f9906105eb6105e59493604051958693602085019061059e565b9061059e565b03601f198101845283610192565b565b50634e487b7160e01b600052603260045260246000fd5b901561061b5790565b61025e6105fb565b604051906106308261014d565b600182527f81000000000000000000000000000000000000000000000000000000000000006020830152565b959293879498979298959195604051998a976020998a8a0161067d9161059e565b6106869161059e565b61068f9161059e565b6106989161059e565b6106a19161059e565b6106aa9161059e565b91823701600081526060519260005b8481106106da575050916105f992016000815203601f198101845283610192565b60808101518184015286935081016106b9565b6107d3906106fe60a082013561097a565b9061072261070f608083013561097a565b61071c606084013561097a565b906105c9565b61074573ffffffffffffffffffffffffffffffffffffffff6040840135166108d9565b61075260c084013561097a565b9060609260e085019367ffffffffffffffff61076e868861054d565b9050169060018214156000146107dd575061078b6107cb91610a19565b945b6107c56107c089518551018651018751018851016107ab848b61054d565b905060605191010167ffffffffffffffff1690565b610ab7565b9661054d565b96909561065c565b6020815191012090565b9490507f80000000000000000000000000000000000000000000000000000000000000006001600160f81b031961082e61082061081a858b61054d565b90610612565b356001600160f81b03191690565b16101561083f575b6107cb9061078d565b93506107cb61084c610623565b949050610836565b604051906108618261014d565b6001825260203681840137565b604051906080820182811067ffffffffffffffff82111761089b575b604052604182526060366020840137565b6108a3610136565b61088a565b906108b2826101b5565b6108bf6040519182610192565b828152601f196108cf82946101b5565b0190602036910137565b906040516108e68161014d565b6015815260217fffffffffffffffffffffffffffffffffffffffff00000000000000000000000082947f9400000000000000000000000000000000000000000000000000000000000000602085015260601b16910152565b60209080511561094c570190565b6109546105fb565b0190565b60609080516040101561094c570190565b60a19080516081101561094c570190565b9060808210156109d65761098c610854565b91806109c457507f80000000000000000000000000000000000000000000000000000000000000005b60001a6109c18361093e565b53565b60f81b6001600160f81b0319166109b5565b6109df82610b24565b916109ec600284016108a8565b926001600160f81b03196081820160f81b1660001a610a0a8561093e565b53601f0360031b1b6021830152565b67ffffffffffffffff1660018114610aa1576038811015610a5d576001600160f81b03196080610a47610854565b920160f81b1660001a610a598261093e565b5390565b610a6681610b24565b90610a73600283016108a8565b916001600160f81b031960b8820160f81b1660001a610a918461093e565b53601f0360031b1b602182015290565b634e487b7160e01b600052600160045260246000fd5b67ffffffffffffffff16906038821015610af0576001600160f81b031960c0610ade610854565b930160f81b1660001a6109c18361093e565b610af982610b24565b91610b06600284016108a8565b926001600160f81b031960f8820160f81b1660001a610a0a8561093e565b906000916fffffffffffffffffffffffffffffffff8111610ba1575b8067ffffffffffffffff60ff9211610b93575b63ffffffff8111610b85575b61ffff8111610b77575b11610b7057565b9060010190565b60029060101c930192610b69565b60049060201c930192610b5f565b60089060401c930192610b53565b6010925060801c610b40565b610d54610d60610c5d92610bc761049c60e083018361054d565b60208151910120604051948591602083019360c08101359060a081013590608081013590606081013590604081013590602081013590358a949192610100969399989794919961012087019a7f192135ce939640eca09b1703f47fdc067a0a240987f051b0ce714ce345b3f03e8852602088015260408701526060860152608085015260a084015260c083015260e08201520152565b0393610c71601f1995868101835282610192565b519020926040516020810190610d0e81610d0246859190606060808401937fc2f8787176b8ac6bf7215b4adcc1e069bf4ab82d9ab1df05a57a91d425935b6e81527f94536914c3c87bf8bccd7c142a04a46168e0bef84c035c2a8dc43a3671b4727060208201527fc89efdaa54c0f20c7adf612882df0950f5a951637e0307cdcb4c672f298b8bc660408201520152565b03848101835282610192565b5190209360405193849160208301968790916042927f19010000000000000000000000000000000000000000000000000000000000008352600283015260228201520190565b03908101835282610192565b51902090565b50634e487b7160e01b600052601160045260246000fd5b60c0608082013591606081013592838102938185041490151715610db2575b01358101809111610daa5790565b61025e610d66565b610dba610d66565b610d9c565b1561021757565b604081013573ffffffffffffffffffffffffffffffffffffffff166fffffffffffffffffffffffffffffffff60c0830135818111610e4257610e129161049c91169360e081019061054d565b9080610e2a57506105f99160208251920190f0610dbf565b81600092916105f99460208594519301915af1610dbf565b606460405162461bcd60e51b815260206004820152600860248201527f4f766572666c6f770000000000000000000000000000000000000000000000006044820152fd5b8151630b135d3f60e11b9392907fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff7e01610faa575b610ec390611291565b90610ed4610ed082611228565b1590565b8015610f98575b610f8f575b90610eee610ef49284610fe4565b92610fe4565b610f2f610f1660005473ffffffffffffffffffffffffffffffffffffffff1690565b73ffffffffffffffffffffffffffffffffffffffff1690565b73ffffffffffffffffffffffffffffffffffffffff8093161491821592610f5f575b5050610f5957565b60009150565b909150610f84610f1660015473ffffffffffffffffffffffffffffffffffffffff1690565b911614153880610f51565b60009450610ee0565b50610fa5610ed083611228565b610edb565b50610ec3604051610fba81610176565b6082815260a0366020830137601b610fdc8282610fd682610958565b53610969565b539050610eba565b61025e91610ff191611154565b919091611019565b6005111561100357565b634e487b7160e01b600052602160045260246000fd5b61102281610ff9565b8061102a5750565b61103381610ff9565b600181036110805760405162461bcd60e51b815260206004820152601860248201527f45434453413a20696e76616c6964207369676e617475726500000000000000006044820152606490fd5b61108981610ff9565b600281036110d65760405162461bcd60e51b815260206004820152601f60248201527f45434453413a20696e76616c6964207369676e6174757265206c656e677468006044820152606490fd5b806110e2600392610ff9565b146110e957565b60405162461bcd60e51b815260206004820152602260248201527f45434453413a20696e76616c6964207369676e6174757265202773272076616c60448201527f75650000000000000000000000000000000000000000000000000000000000006064820152608490fd5b9060418151146000146111825761117e916020820151906060604084015193015160001a9061118c565b9091565b5050600090600290565b9291907f7fffffffffffffffffffffffffffffff5d576e7357a4501ddfe92f46681b20a0831161121c5791608094939160ff602094604051948552168484015260408301526060820152600093849182805260015afa1561120f57815173ffffffffffffffffffffffffffffffffffffffff811615611209579190565b50600190565b50604051903d90823e3d90fd5b50505050600090600390565b604181510361127f5760ff6041604083015192015116601b8114159081611285575b5061127f577f7fffffffffffffffffffffffffffffff5d576e7357a4501ddfe92f46681b20a01061127a57600190565b600090565b50600090565b601c915014153861124a565b60828151036112f3576112a261086e565b916112ab61086e565b916020810151604082015160ff6041840151169160208701526040860152606085015360618101519060ff608260818301519201511691602085015260408401526060830153565b606460405162461bcd60e51b815260206004820152600e60248201527f496e76616c6964206c656e6774680000000000000000000000000000000000006044820152fdfea2646970667358221220da24021dec85fe914d277d24d136cc32cc99d1a6158acdf08b68c42fe054a4af64736f6c63430008110033";
    
        let senderPvtKey = pvtKeyfromSeed("acc1");
        let to = "0x0000000000000000000000000000000001000011";
        let val = 666;
        let data = installCodeCallData;

        let txResp = await simpleLegacyTx(senderPvtKey, to, val, data);
        console.log(txResp);
        
        
        // Part A: deploy a contract
        /**
        contract InstalledCode {
            function foo() public payable returns (uint) {
                return 999;
            }
        }
        // To call foo() => c2985578
        */
        
        const contractData = "0x6080806040526004361015601257600080fd5b60003560e01c63c298557814602657600080fd5b60007ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffc360112605957806103e760209252f35b600080fdfea26469706673582212206ca4c9c8b54e9fb98a2594de83034e716d3ca6f3da5718ea465373e9cf5555c864736f6c63430008110033";

        to = "0x0000000000000000000000000000000000000000"; // deploy
        val = 0;
        data = contractData;

        //get the deterministic address before deploying
        //let senderPvtKey = pvtKeyfromSeed("acc1");
        let from = new ethers.Wallet(senderPvtKey).address;
        let nonce = await ethers.provider.getTransactionCount(from); 

        let deployedAddress = getContractAddress({from, nonce});
        console.log("\nThe contract will be deployed at " + deployedAddress + " with nonce " + nonce);

        txResp = await simpleLegacyTx(senderPvtKey, to, val, data);
        console.log(txResp);

        
        /// 3B Call the deployed contract. 
        to = deployedAddress; //contract created above
        val = 666;
        data = "0xc2985578";

        txResp = await simpleLegacyTx(senderPvtKey, to, val, data);
        console.log(txResp);

        console.log("Deployed contract has value: " + await ethers.provider.getBalance(deployedAddress));        
    }
    
    
    
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Encode a AA Transaction
    // 4337 format with from, customSig and type
    // encode with arbitrary data for custom sig.
    // For custom signature, encode the TX with just "0x" in customSig field, then sign the hash. inser that signature into regular encoding
    // (Todo) The multiple signatures can be concatenated to create multisigs 
    encodeAATransaction();

    async function encodeAATransaction() {
        let senderPvtKey = pvtKeyfromSeed("acc3");
        let from = new ethers.Wallet(senderPvtKey).address;
        // the last argument is "CustomSignature" or CustomSig
        let aaTx = await newAATx(user1.address, from, 1, '0xdada', '0xdeadbeef');
         
        let result =  await serializeTR(aaTx);
        console.log("The encoded TX is: ", result);
        
        let parsedTx = parse(result);
        console.log("The parsed Tx is: ", parsedTx, "\nwith custom signature", parsedTx.customData.any);
    
        // encode TX without customSig
        let aaNoSig = encode4337withoutCustomSig(parsedTx);
        let encodedNoSig = parse(aaNoSig);
    
        /// Sign the parsed hash (without CustomSig) with a wallet
        /// This can be repeated for multisigs
        let walletCow = new ethers.Wallet(pvtKeyfromSeed("acc4"));
        const cowSign = await walletCow.signMessage(encodedNoSig.hash);
        console.log("The hash of tx (without customsig) signed by a wallet", cowSign);
    
        // check sig components
        console.log("The signature components are: ", splitSignature(cowSign));
    
        //then encode transaction again with customSig
        let aaTexWithCustomSig = await newAATx(user1.address, from, 1, '0xdada', cowSign);
        //with parsed value
        console.log("AA TX with customSig:", parse(await serializeTR(aaTexWithCustomSig)));        
    }
         

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    // Populate a legacy transaction
    // Use chainId to determine gasPrice, 900M for hardhat, 1 for RSK regtest
    async function newUnsignedLegacyTx(to: string, from: string, value: number, data?: string): Promise<TransactionRequest>  {
        const chainId = (await ethers.provider.getNetwork()).chainId 

        let tx: TransactionRequest;
        tx = {
            to: to, 
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
    async function simpleLegacyTx(rskPvtKey: string, to: string, value: number, data?: string ) {
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

    
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });