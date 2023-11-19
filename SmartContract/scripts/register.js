const eVote = artifacts.require("eVote.sol")
const { genMerkleProof, genPublicKeyAndProof, register } = require('../api/cli.js')

module.exports = async function (callback) {
    try {
        const eVoteInstance = await eVote.deployed();
        const voterIndex = parseInt(process.argv[4]);
        const accounts = await web3.eth.getAccounts();

        console.log({accounts})
        const admin = accounts[0];
        const account = accounts[voterIndex];

        const signature = await web3.eth.sign(web3.utils.sha3("Input"), account);

        const _merkleProof = genMerkleProof(Buffer.from(account.substring(2), 'hex'), accounts.slice(0, accounts.length - 1).map(x => Buffer.from(x.substring(2), 'hex')))

        const { privateKey, publicKey, publicKeyProof } = await genPublicKeyAndProof()
        await register(signature, eVoteInstance, account, admin, publicKey, publicKeyProof,  _merkleProof)
        console.log({account, publicKey, privateKey})

    } catch (error) {
        console.error(error);
        callback(error);
    }
};