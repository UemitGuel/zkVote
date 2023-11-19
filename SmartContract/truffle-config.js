const HDWalletProvider = require('@truffle/hdwallet-provider');

const privateKeys = [
  "1ab173ef409a3e7621d5ca93478ab907d9a41fe8afe0e5c4daea01ab9b545566",
  "c3b66f755e032321ed635759d1911197d7acf335ba856655e97fc69d0d960576",
  "3ef35821e349fdcbd0c095a999b1359b48588c29579675104b62cd05b2ce72bf",
  // Add more private keys here if needed
];

const providerOrUrl = privateKeys

const goerliProvider = new HDWalletProvider({
  privateKeys: providerOrUrl,
  providerOrUrl: 'https://goerli.infura.io/v3/965388cc82c74bdebaff9369676323fc', // Replace with your desired RPC URL
});

const lineaProvider = new HDWalletProvider({
  privateKeys: providerOrUrl,
  providerOrUrl: 'https://linea-goerli.infura.io/v3/965388cc82c74bdebaff9369676323fc', // Replace with your desired RPC URL
});


module.exports = {
  mocha: {
    enableTimeouts: false
  },
  networks: {
    development: {
     host: "127.0.0.1",     // Localhost (default: none)
     port: 8545,            // Standard Ethereum port (default: none)
     network_id: "*",       // Any network (default: none)
     gas: 30000000,
     gasPrice: null,
    },
    goerli: {
      provider: goerliProvider,
      network_id: '5', // Replace with the network ID you're using
    },
    linea_testnet: {
      provider: lineaProvider,
      network_id: "59140",
    }
  },
  // Configure your compilers
  compilers: {
    solc: {
      version: "0.8.10",    // Fetch exact version from solc-bin (default: truffle's version)
      docker: false,        // Use "0.5.1" you've installed locally with docker (default: false)
      settings: {          // See the solidity docs for advice about optimization and evmVersion
        optimizer: {
          enabled: true,
          runs: 100
        },
        evmVersion: "byzantium"
      }
    }
  }
}