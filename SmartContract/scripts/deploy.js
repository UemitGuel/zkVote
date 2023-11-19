const verifierZKSNARK = artifacts.require("verifierZKSNARK")
const { getVerificationKeys } = require('../helper/verificationKeys.js')

module.exports = async function (callback) {
    try {
        const verifierZKSNARKInstance = await verifierZKSNARK.deployed();
        console.log(`verifierZKSNARKInstance`)

        const verifierPublicKeyVkey = getVerificationKeys('../build/verifier_PublicKey.json')
        let tx = await verifierZKSNARKInstance.setVerifyingKey(verifierPublicKeyVkey, 0);
        console.log(`tx: ${tx.receipt.gasUsed.toString()}`)
        
        const verifierEncrpytedVoteVkey = getVerificationKeys('../build/verifier_EncrpytedVote.json')
        tx = await verifierZKSNARKInstance.setVerifyingKey(verifierEncrpytedVoteVkey, 1);
        console.log(`tx: ${tx.receipt.gasUsed.toString()}`)
        
        const verifierTallyingVkey = getVerificationKeys('../build/verifier_tallying.json')
        tx = await verifierZKSNARKInstance.setVerifyingKey(verifierTallyingVkey, 2);
        console.log(`tx: ${tx.receipt.gasUsed.toString()}`)
    } catch (error) {
        console.error(error);
        callback(error);
    }
};


