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
   > transaction hash:    0x100cd68f12ba17ca9fa766cae2d670aa15fde5feb06d2ccc257ac26c3820908b
   > Blocks: 2            Seconds: 8
   > contract address:    0x02F5059A085D40E045f0384C4456eaf50437fb2B
   > block number:        2054883
   > block timestamp:     1700342331
   > account:             0x0DEc08649851BcF0Aa441Bff25cf54CBd2A2cc95
   > balance:             0.499002214997206202
   > gas used:            176717 (0x2b24d)
   > gas price:           2.500000007 gwei
   > value sent:          0 ETH
   > total cost:          0.000441792501237019 ETH


   Deploying 'verifierMerkleTree'
   ------------------------------
   > transaction hash:    0x32593cbe99c6d09d3011758355711d05f8fa9143258235a8395853dd5cea610d
   > Blocks: 2            Seconds: 9
   > contract address:    0x26a1EfF203200576029D8BdEaD5f295dC577E4F6
   > block number:        2054886
   > block timestamp:     1700342349
   > account:             0x0DEc08649851BcF0Aa441Bff25cf54CBd2A2cc95
   > balance:             0.498522152495862027
   > gas used:            192025 (0x2ee19)
   > gas price:           2.500000007 gwei
   > value sent:          0 ETH
   > total cost:          0.000480062501344175 ETH


   Deploying 'verifierZKSNARK'
   ---------------------------
   > transaction hash:    0x4d16c1013f3292a66ec78b80c3fe684191df8769d9f195c16c74be8b46821cb8
   > Blocks: 2            Seconds: 13
   > contract address:    0x7F18de2ae049d22b3a76E09da4938EE6f1e8C705
   > block number:        2054889
   > block timestamp:     1700342367
   > account:             0x0DEc08649851BcF0Aa441Bff25cf54CBd2A2cc95
   > balance:             0.495153514986429842
   > gas used:            1347455 (0x148f7f)
   > gas price:           2.500000007 gwei
   > value sent:          0 ETH
   > total cost:          0.003368637509432185 ETH


   Deploying 'eVote'
   -----------------
   > transaction hash:    0x1541972b0edec1a9f53e726905cb2cdbb84148809b8874f40025945d478719a6
   > Blocks: 2            Seconds: 8
   > contract address:    0x9F9AFd00D382860b90698769e1Fb467592757d63
   > block number:        2054892
   > block timestamp:     1700342385
   > account:             0x0DEc08649851BcF0Aa441Bff25cf54CBd2A2cc95
   > balance:             0.490539157473509641
   > gas used:            1845743 (0x1c29ef)
   > gas price:           2.500000007 gwei
   > value sent:          0 ETH
   > total cost:          0.004614357512920201 ETH

   > Saving migration to chain.
   > Saving artifacts
   -------------------------------------
   > Total cost:     0.00890485002493358 ETH

Summary
=======
> Total deployments:   5
> Final cost:          0.009346642526170599 ETH

```