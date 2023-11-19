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
export const genPublicKeyAndProof = async (userAddress) => {
    // const { privateKey, publicKey, publicKeyProof } = (await genPublicKeysAndProofs(1))[0]
    await new Promise(r => setTimeout(r, ZK_SNARK_PROOF_TIME));
    const dummyPrivateKey = "2736030358979909402780800718157159386076813972158567259200215660948447369250"
    const dummyPublicKey = ["10190049291252793582308170666613495997454030951364905468846264061410496715143", "15414463958057736033921680881249553734524724558505769324932579765927317951278"]
    const dummyPublicKeyProof = {
        "a": [
            "9351618801121362753523788239260515044332714392722868319151992771427285307077",
            "20128124516603739189764421666440880266594370828362913418759244330399364579965"
        ],
        "b": [
            [
                "17281817623814718285765199798074986511414956010924533596665565244817003049197",
                "14419604283028791609563704458185222116256943266990573563524530947453713566411"
            ],
            [
                "14677167131259379454667270822197045528289717771632078595374930762456184768370",
                "2357697312153627282740393009002221212793172586124302474391360546500784231259"
            ]
        ],
        "c": [
            "3661755948547119736930589758183840670339056501356428192571501594088507083572",
            "7466154867562330992925176056630413598869540796309745832066845812363253681945"
        ]
    }

    // const hash = hashFunctionArguments(userAddress, dummyPublicKey, dummyPublicKeyProof.a, dummyPublicKeyProof.b, dummyPublicKeyProof.c);
    const dummyHash = ethers.utils.keccak256("0x2234567890123456789012345678901234567890123456789012345678901234")

    return {
        privateKey: dummyPrivateKey,
        publicKey: dummyPublicKey,
        publicKeyProof: dummyPublicKeyProof,
        hash: dummyHash,
    }
}

// returns Idx
const TX_TIME = 3000
export const register = async (userAddress, publicKey, publicKeyProof, _merkleProof, signature) => {
    // return eVoteInstance.register(publicKey, publicKeyProof.a, publicKeyProof.b, publicKeyProof.c, _merkleProof, { from: accounts[i + 1] })
    await new Promise(r => setTimeout(r, TX_TIME));
    return 2
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

export const genEncryptedVoteAndProof = async (userAddress, publicKeyX, publicKeyY, Idx, privateKey, Vote) => {
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
    const dummyEncryptedVote = ["10190049291252793582308170666613495997454030951364905468846264061410496715143", "15414463958057736033921680881249553734524724558505769324932579765927317951278"]

    const dummyEncryptedVoteProof = {
        "a": [
            "9351618801121362753523788239260515044332714392722868319151992771427285307077",
            "20128124516603739189764421666440880266594370828362913418759244330399364579965"
        ],
        "b": [
            [
                "17281817623814718285765199798074986511414956010924533596665565244817003049197",
                "14419604283028791609563704458185222116256943266990573563524530947453713566411"
            ],
            [
                "14677167131259379454667270822197045528289717771632078595374930762456184768370",
                "2357697312153627282740393009002221212793172586124302474391360546500784231259"
            ]
        ],
        "c": [
            "3661755948547119736930589758183840670339056501356428192571501594088507083572",
            "7466154867562330992925176056630413598869540796309745832066845812363253681945"
        ]
    }

    // const hash = hashFunctionArguments(userAddress, dummyEncryptedVote, dummyEncryptedVoteProof.a, dummyEncryptedVoteProof.b, dummyEncryptedVoteProof.c);
    // dummyHash is just random 32 bytes
    const dummyHash = ethers.utils.keccak256("0x1234567890123456789012345678901234567890123456789012345678901234")

    return {
        encryptedVote: dummyEncryptedVote,
        encryptedVoteProof: dummyEncryptedVoteProof,
        hash: dummyHash,
    }
}

// returns Promise<tx>
export const castVote = async (userAddress, encryptedVote, Idx, encryptedVoteProof, signature) => {
    // return eVoteInstance.castVote(encryptedVote, Idx, encryptedVoteProof.a, encryptedVoteProof.b, encryptedVoteProof.c, { from: accounts[i + 1] })
    await new Promise(r => setTimeout(r, TX_TIME));
    return {}
}



const eVoteInstance = undefined // how to instantiate it?