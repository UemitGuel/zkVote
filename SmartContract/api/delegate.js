const {
    genPublicKeysAndProofs,
    genEncryptedVotesAndProofs,
} = require('../helper/voters')

const { MerkleTree } = require('../helper/merkletree.js')


// returns Promise<tx>
export const register = async (userAddress, publicKey, publicKeyProof, _merkleProof) => {
    return eVoteInstance.register(publicKey, publicKeyProof.a, publicKeyProof.b, publicKeyProof.c, _merkleProof, { from: accounts[i + 1] })
}

// returns Promise<tx>
export const castVote = async (userAddress, encryptedVote, Idx, encryptedVoteProof) => {
    return eVoteInstance.castVote(encryptedVote, Idx, encryptedVoteProof.a, encryptedVoteProof.b, encryptedVoteProof.c, { from: accounts[i + 1] })
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
export const genPublicKeyAndProof = async () => {
    const { privateKey, publicKey, publicKeyProof } = (await genPublicKeysAndProofs(1))[0]
    return { privateKey, publicKey, publicKeyProof }
}


// return Promise<string[]>
export const genMerkleProof = async (userAddress) => {
    const merkleTree = new MerkleTree([])
    const _merkleProof = merkleTree.getHexProof(userAddress)
    return _merkleProof
}

const eVoteInstance = undefined // how to instantiate it?

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

export const genEncryptedVoteAndProof = async (publicKeyX, publicKeyY, Idx, privateKey, Vote) => {
    const voters = [{
        publicKey: [publicKeyX, publicKeyY],
        Idx: Idx,
        xi: privateKey,
        vote: Vote
    }]
    await genEncryptedVotesAndProofs(voters)
    return { encryptedVote: voters[0].encryptedVote, encryptedVoteProof: voters[0].encryptedVoteProof }
}