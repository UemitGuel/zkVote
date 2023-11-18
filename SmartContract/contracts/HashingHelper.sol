// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./ECRecover.sol";

contract HashingHelper {
    // Solidity function to create the same hash as in the JavaScript code
    function formatAndHashMessage(
        bytes32 message
    ) public view returns (bytes32 hashedMessage) {
        assembly {
            mstore(0x00, "\x19Ethereum Signed Message:\n32")
            mstore(0x1c, message)
            hashedMessage := keccak256(0x00, 0x3c)
        }
    }

    function hashRegisterArguments(
        address sender,
        uint[] memory _pubKey,
        uint[2] memory proof_a,
        uint[2][2] memory proof_b,
        uint[2] memory proof_c
    ) public view returns (bytes32 hashedMessage) {
        bytes32 senderInBytes = bytes20(sender);
        uint _pubKey0 = _pubKey[0];
        uint _pubKey1 = _pubKey[1];
        uint proof_a0 = proof_a[0];
        uint proof_a1 = proof_a[1];
        uint proof_b00 = proof_b[0][0];
        uint proof_b01 = proof_b[0][1];
        uint proof_b10 = proof_b[1][0];
        uint proof_b11 = proof_b[1][1];
        uint proof_c0 = proof_c[0];
        uint proof_c1 = proof_c[1];
        assembly {
            mstore(0x05E0, senderInBytes)
            mstore(0x0600, _pubKey0)
            mstore(0x0620, _pubKey1)
            mstore(0x0640, proof_a0)
            mstore(0x0660, proof_a1)
            mstore(0x0680, proof_b00)
            mstore(0x06A0, proof_b01)
            mstore(0x06C0, proof_b10)
            mstore(0x06E0, proof_b11)
            mstore(0x0700, proof_c0)
            mstore(0x0720, proof_c1)
            hashedMessage := keccak256(0x05E0, 0x0740)
        }
    }

    function hashVoteArguments(
        address sender,
        uint[2] memory _encryptedVote,
        uint[2] memory proof_a,
        uint[2][2] memory proof_b,
        uint[2] memory proof_c,
        uint _Idx
    ) public view returns (bytes32 hashedMessage) {
        bytes32 senderInBytes = bytes20(sender);
        uint _encryptedVote0 = _pubKey[0];
        uint _EncryptedVote1 = _pubKey[1];
        uint proof_a0 = proof_a[0];
        uint proof_a1 = proof_a[1];
        uint proof_b00 = proof_b[0][0];
        uint proof_b01 = proof_b[0][1];
        uint proof_b10 = proof_b[1][0];
        uint proof_b11 = proof_b[1][1];
        uint proof_c0 = proof_c[0];
        uint proof_c1 = proof_c[1];
        assembly {
            mstore(0x05E0, senderInBytes)
            mstore(0x0600, _pubKey0)
            mstore(0x0620, _pubKey1)
            mstore(0x0640, proof_a0)
            mstore(0x0660, proof_a1)
            mstore(0x0680, proof_b00)
            mstore(0x06A0, proof_b01)
            mstore(0x06C0, proof_b10)
            mstore(0x06E0, proof_b11)
            mstore(0x0700, proof_c0)
            mstore(0x0720, proof_c1)
            mstore(0x0720, _Idx)
            hashedMessage := keccak256(0x05E0, 0x0760)
        }
    }

    function recoverSigner(
        bytes32 hashedMessage,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) public view returns (address recovered) {
        recovered = ECDSA.recover(hashedMessage, v, r, s);
    }
}
