const {
    genPublicKeysAndProofs,
    genEncryptedVotesAndProofs,
} = require('../helper/voters')

const { MerkleTree } = require('../helper/merkletree.js')

// return Promise<string[]>
export const genMerkleProof = (userAddress) => {
    const eligableVoters = ["0x123", "0x456", "0x789"]
    const merkleTree = new MerkleTree(eligableVoters)
    const _merkleProof = merkleTree.getHexProof(eligableVoters[0])
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
const ZK_SNARK_PROOF_TIME = 3000
export const genPublicKeyAndProof = async () => {
    // const { privateKey, publicKey, publicKeyProof } = (await genPublicKeysAndProofs(1))[0]
    await new Promise(r => setTimeout(r, ZK_SNARK_PROOF_TIME));
    const dummyPrivateKey = "0x123"
    const dummyPublicKey = [123, 456]
    const dummyPublicKeyProof = {
        a: [123, 456],
        b: [
            [123, 456],
            [123, 456],
        ],
        c: [123, 456]
    }

    return {
        privateKey: dummyPrivateKey,
        publicKey: dummyPublicKey,
        publicKeyProof: dummyPublicKeyProof
    }
}

// returns Promise<tx>
const TX_TIME = 3000
export const register = async (userAddress, publicKey, publicKeyProof, _merkleProof) => {
    // return eVoteInstance.register(publicKey, publicKeyProof.a, publicKeyProof.b, publicKeyProof.c, _merkleProof, { from: accounts[i + 1] })
    await new Promise(r => setTimeout(r, TX_TIME));
    return {}
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

export const genEncryptedVoteAndProof = async (publicKeyX, publicKeyY, Idx, privateKey, Vote) => {
    const voters = [{
        publicKey: [publicKeyX, publicKeyY],
        Idx: Idx,
        xi: privateKey,
        vote: Vote
    }]
    await new Promise(r => setTimeout(r, ZK_SNARK_PROOF_TIME));
    // await genEncryptedVotesAndProofs(voters)
    // return {
    //     encryptedVote: voters[0].encryptedVote,
    //     encryptedVoteProof: voters[0].encryptedVoteProof
    // }
    const dummyEncryptedVote = [123, 456]
    const dummyEncryptedVoteProof = {
        a: [123, 456],
        b: [
            [123, 456],
            [123, 456],
        ],
        c: [123, 456]
    }


    return {
        encryptedVote: dummyEncryptedVote,
        encryptedVoteProof: dummyEncryptedVoteProof
    }
}

// returns Promise<tx>
export const castVote = async (userAddress, encryptedVote, Idx, encryptedVoteProof) => {
    // return eVoteInstance.castVote(encryptedVote, Idx, encryptedVoteProof.a, encryptedVoteProof.b, encryptedVoteProof.c, { from: accounts[i + 1] })
    await new Promise(r => setTimeout(r, TX_TIME));
    return {}
}



const eVoteInstance = undefined // how to instantiate it?