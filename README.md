# zkVote
EthGlobal Istanbul

We are enhancing a well-known [Open Vote Network (OVN)](https://eprint.iacr.org/2022/310) protocol with an iOS app and gasless vote casts for a great user experience. We are using WalletConnect for the iOS app and ERC4337 paymaster protocol.

We are reusing the voting protocol from [zkSNARK-Open-Vote-Network](https://github.com/mhgharieb/zkSNARK-Open-Vote-Network)

Project strucutre:
- `SmartContract`: contains the OVN smart contracts and the zkSNARK circuits.
- `delegate`: contains the iOS app delegate (the iOS companion app that should be merged into the native iOS app in the future)
- `iOSApp`: contains the iOS app

# Deployment

The smart contracts have been deployed on the Goerli Linea Network
Using following commands:
- `truffle migrate --network linea_testnet`
- `cd scripts`
- `truffle exec deploy.js --network linea_testnet`
- `truffle exec register.js [userId] --network linea_testnet`

See the smart contract address at [Blockscout](https://explorer.goerli.linea.build/address/0x381f7b4AE7B5c133c551518b7A5376C370A41E6F).
```
2_deploy_contracts_migration.js
===============================
{
  accounts: [
    '0x0DEc08649851BcF0Aa441Bff25cf54CBd2A2cc95',
    '0xd3ced000F8292D02c5bE32AF90B4579F8aD30Be8',
    '0xFE66E1ef74B04b4d53E9673f1257fC361769797d'
  ]
}

   Replacing 'Migrations'
   ----------------------
   > transaction hash:    0xbc6837bfd283fd852aed1cbaf052e060545495a5d8c1c25358a97aba755fd587
   > Blocks: 2            Seconds: 8
   > contract address:    0x84a91a53A324313D4B380567F0d5d66D76008735
   > block number:        2056532
   > block timestamp:     1700352239
   > account:             0x0DEc08649851BcF0Aa441Bff25cf54CBd2A2cc95
   > balance:             0.46445484990047358
   > gas used:            176717 (0x2b24d)
   > gas price:           2.500000007 gwei
   > value sent:          0 ETH
   > total cost:          0.000441792501237019 ETH


   Replacing 'verifierMerkleTree'
   ------------------------------
   > transaction hash:    0x01ecbbcda5708b7b99d59dfb1d9a6c0df335c726cd1b739dc804900115652653
   > Blocks: 1            Seconds: 4
   > contract address:    0x98140140FDaF699E2E9F9DfEc86eBACd96dD9fb6
   > block number:        2056534
   > block timestamp:     1700352251
   > account:             0x0DEc08649851BcF0Aa441Bff25cf54CBd2A2cc95
   > balance:             0.463974787399129405
   > gas used:            192025 (0x2ee19)
   > gas price:           2.500000007 gwei
   > value sent:          0 ETH
   > total cost:          0.000480062501344175 ETH


   Replacing 'verifierZKSNARK'
   ---------------------------
   > transaction hash:    0xce391ca121c9a9ccb8e0b758344c3e7b9946a5c8f5d825cb4a7ee2e8289fae80
   > Blocks: 1            Seconds: 4
   > contract address:    0x50A63c61407cce42beeC7C5a904160192B0093b7
   > block number:        2056536
   > block timestamp:     1700352263
   > account:             0x0DEc08649851BcF0Aa441Bff25cf54CBd2A2cc95
   > balance:             0.46060614988969722
   > gas used:            1347455 (0x148f7f)
   > gas price:           2.500000007 gwei
   > value sent:          0 ETH
   > total cost:          0.003368637509432185 ETH


   Replacing 'eVote'
   -----------------
   > transaction hash:    0x8ad06839cdf840754aad458ecb99bac523f0791aadce3c9de30f57ac57378424
   > Blocks: 2            Seconds: 8
   > contract address:    0x381f7b4AE7B5c133c551518b7A5376C370A41E6F
   > block number:        2056538
   > block timestamp:     1700352275
   > account:             0x0DEc08649851BcF0Aa441Bff25cf54CBd2A2cc95
   > balance:             0.456074679877009104
   > gas used:            1812588 (0x1ba86c)
   > gas price:           2.500000007 gwei
   > value sent:          0 ETH
   > total cost:          0.004531470012688116 ETH

   > Saving migration to chain.
   > Saving artifacts
   -------------------------------------
   > Total cost:     0.008821962524701495 ETH

Summary
=======
> Total deployments:   5
> Final cost:          0.009263755025938514 ETH

```