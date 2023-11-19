const {
    genPublicKeysAndProofs,
    genEncryptedVoteAndProof,
} = require('../helper/voters')

const EthereumJSUtil = require('ethereumjs-util');

const { MerkleTree } = require('../helper/merkletree.js')

// return Promise<string[]>
const genMerkleProof = (userAddress, eligableVoters) => {
    const merkleTree = new MerkleTree(eligableVoters)
    const _merkleProof = merkleTree.getHexProof(userAddress)
    return _merkleProof
}


/*
    "privateKey": string,
    "publicKey" : snarkjs.PublicSignals// my guess int[2],
    publicKeyProof : {
            a: [proof.pi_a[0], proof.pi_a[1]],
            b: [
                [proof.pi_b[0][1], proof.pi_b[0][0]],
                [proof.pi_b[1][1], proof.pi_b[1][0]],
              ],
            c: [proof.pi_c[0], proof.pi_c[1]]
        }
*/
const genPublicKeyAndProof = async () => {
    const { privateKey, publicKey, publicKeyProof } = (await genPublicKeysAndProofs(1))[0]
    return {
        privateKey,
        publicKey,
        publicKeyProof
    }
}

// returns Idx
const register = async (signature, eVoteInstance, sender, fromAccount, publicKey, publicKeyProof, _merkleProof) => {
    const { v, r, s } = EthereumJSUtil.fromRpcSig(signature);
    console.log("Register Data", JSON.stringify({
        sender, v, r, s, _pubKey: publicKey,
        proof_a: publicKeyProof.a,
        proof_b: publicKeyProof.b,
        proof_c: publicKeyProof.c,
        _merkleProof,
    }, null, 4))
    await eVoteInstance.register(sender,v,r,s, publicKey, publicKeyProof.a, publicKeyProof.b, publicKeyProof.c, _merkleProof, { from: fromAccount })
}


/*
encryptedVote: snarkjs.PublicSignals// my guess int[2],
encryptedVoteProof : {
            a: [proof.pi_a[0], proof.pi_a[1]],
            b: [
                [proof.pi_b[0][1], proof.pi_b[0][0]],
                [proof.pi_b[1][1], proof.pi_b[1][0]],
              ],
            c: [proof.pi_c[0], proof.pi_c[1]]
        }
*/

const genEncryptedVoteAndProofApi = async (publicKeyX, publicKeyY, Idx, privateKey, Vote) => {
    const voters = [{
        Idx: Idx,
        xi: privateKey,
        vote: Vote
    }]
    await genEncryptedVoteAndProof(voters, publicKeyX, publicKeyY)
    return {
        encryptedVote: voters[0].encryptedVote,
        encryptedVoteProof: voters[0].encryptedVoteProof
    }
}

// returns Promise<tx>
const castVote = async (eVoteInstance, sender, signature, fromAccount, encryptedVote, Idx, encryptedVoteProof) => {

    const { v, r, s } = EthereumJSUtil.fromRpcSig(signature);

    return eVoteInstance.castVote(sender, v,r,s, encryptedVote, Idx, encryptedVoteProof.a, encryptedVoteProof.b, encryptedVoteProof.c, { from: fromAccount })
}
module.exports =  {
    genMerkleProof,
    genPublicKeyAndProof,
    register ,
    genEncryptedVoteAndProofApi,
    castVote,
}