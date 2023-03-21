# Sample Install Code

Install Code example with simple contract example. We install the same code two ways. 
Once with installcode with `deployedBytecode`and again in the usual manner. 
Then we check that the code behaves the same when called from outside.

Run the example with a RSKJ node (regtest mode) that has the installcode precompiled
 contract implemented, such as the `AA-poc` [branch](https://github.com/rsksmart/rskj/tree/AA-poc)

```shell
npx hardhat run scripts/ex-encode.ts --network localhost
```

The above example illustrates injecting code into an EOA account using a TX sent from 
a different EOA account. This keeps the two EOA account nonces separate for clarity. The
nonce for the EOA account where code is to installed must be known in advance, and this 
is used as part of a signed message to indicate that the EOA owner approves the addition
of code, which makes the account state `smart` - which indicates a new accounttype 
that is both an EOA and a contract. 

The goal of installcode is not to inject arbitrary code. Rather, the code is expected to 
be a smart contract wallet, leading to a native version of account abstraction.