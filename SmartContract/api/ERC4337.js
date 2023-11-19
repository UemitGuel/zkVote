const ethers = require('ethers');

function hashFunctionArguments(sender, _pubKey, proof_a, proof_b, proof_c) {
    const senderInBytes = ethers.utils.arrayify(sender);
    const _pubKey0 = ethers.BigNumber.from(_pubKey[0]).toHexString();
    const _pubKey1 = ethers.BigNumber.from(_pubKey[1]).toHexString();
    const proof_a0 = ethers.BigNumber.from(proof_a[0]).toHexString();
    const proof_a1 = ethers.BigNumber.from(proof_a[1]).toHexString();
    const proof_b00 = ethers.BigNumber.from(proof_b[0][0]).toHexString();
    const proof_b01 = ethers.BigNumber.from(proof_b[0][1]).toHexString();
    const proof_b10 = ethers.BigNumber.from(proof_b[1][0]).toHexString();
    const proof_b11 = ethers.BigNumber.from(proof_b[1][1]).toHexString();
    const proof_c0 = ethers.BigNumber.from(proof_c[0]).toHexString();
    const proof_c1 = ethers.BigNumber.from(proof_c[1]).toHexString();

    const concatenated = senderInBytes + _pubKey0.slice(2) + _pubKey1.slice(2) + proof_a0.slice(2) +
        proof_a1.slice(2) + proof_b00.slice(2) + proof_b01.slice(2) +
        proof_b10.slice(2) + proof_b11.slice(2) + proof_c0.slice(2) +
        proof_c1.slice(2);

    const hashedMessage = ethers.utils.keccak256(concatenated);
    return hashedMessage;
}
module.exports = {
    hashFunctionArguments,
    
}