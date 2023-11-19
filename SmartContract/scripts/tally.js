import { tallying } from "../helper/administrator"

const eVote = artifacts.require("eVote.sol")

module.exports = async function (callback) {
    try {
        const eVoteInstance = await eVote.deployed();
        // Example: calling a function of the eVote contract
        const result = await eVoteInstance.yourFunctionName(/* parameters */);
        console.log("Result:", result);


        const { tallyingProof, tallyingResult } = await tallying(encryptedVotes)
        assert(expectedTallyingResult == tallyingResult, "Error: Tallying Result provided by the Tallying circuit is not equal to the expected Tallying result")
        _tallyingProof = tallyingProof
        _tallyingResult = tallyingResult
    } catch (error) {
        console.error(error);
        callback(error);
    }
};
