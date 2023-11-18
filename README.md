# zkVote
EthGlobal Istanbul

We are enhancing a well-known [Open Vote Network (OVN)](https://eprint.iacr.org/2022/310) protocol with an iOS app and gasless vote casts for a great user experience. We are using WalletConnect for the iOS app and ERC4337 paymaster protocol.

We are reusing the voting protocol from [zkSNARK-Open-Vote-Network](https://github.com/mhgharieb/zkSNARK-Open-Vote-Network)

Project strucutre:
- `SmartContract`: contains the OVN smart contracts and the zkSNARK circuits.
- `delegate`: contains the iOS app delegate (the iOS companion app that should be merged into the native iOS app in the future)
- `iOSApp`: contains the iOS app