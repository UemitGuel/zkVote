const eVote = artifacts.require("eVote.sol")
const { genPublicKeyAndProof, register, genEncryptedVoteAndProofApi, castVote } = require('../api/cli.js')
const state = {
    "0x0DEc08649851BcF0Aa441Bff25cf54CBd2A2cc95": {
        publicKey: [5755631107250429113682937206113928933505205102253501767096159798111442645779n, 15963389381537737239446234323145197648908680410038531845941104703415518197814n ],
        privateKey: 2736030358979909402780800718157159386076813972158567259200215660948447366050n,
    },
    "0xd3ced000F8292D02c5bE32AF90B4579F8aD30Be8": {
        publicKey: [5748863921515272031543182670497186531194290760363790580263833325124969305025n, 5902546745033719005931733221982791691983789339613534821383535218474639725109n  ],
        privateKey: 2736030358979909402780800718157159386076813972158567259200215660948447367377n,
    }
}
module.exports = async function (callback) {
    try {
        const eVoteInstance = await eVote.deployed();
        const voterIndex = parseInt(process.argv[4]);
        const trueFalse = parseInt(process.argv[5]);
        const accounts = await web3.eth.getAccounts();

        console.log({ accounts })
        const admin = accounts[0];
        const account = accounts[voterIndex];

        const signature = await web3.eth.sign(web3.utils.sha3("Input"), account);

        const { publicKey, privateKey } = state[account]

        const VotingKeysX = [state['0x0DEc08649851BcF0Aa441Bff25cf54CBd2A2cc95'].publicKey[0], state['0xd3ced000F8292D02c5bE32AF90B4579F8aD30Be8'].publicKey[0]]
        const VotingKeysY = [state['0x0DEc08649851BcF0Aa441Bff25cf54CBd2A2cc95'].publicKey[1], state['0xd3ced000F8292D02c5bE32AF90B4579F8aD30Be8'].publicKey[1]]

        const { encryptedVote, encryptedVoteProof } = await genEncryptedVoteAndProofApi(VotingKeysX, VotingKeysY, voterIndex, privateKey, trueFalse == "true")
        await castVote(eVoteInstance, account, signature, admin, encryptedVote, voterIndex, encryptedVoteProof)
        console.log({ account, publicKey, privateKey, encryptedVote })

    } catch (error) {
        console.error(error);
        callback(error);
    }
};