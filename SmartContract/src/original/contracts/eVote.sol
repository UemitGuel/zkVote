// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;
import "./verifier_MerkleTree.sol";
import "./verifier_zkSNARK.sol";
import "./HashingHelper.sol";

contract eVote is HashingHelper {
    verifierMerkleTree vMerkleProof;
    verifierZKSNARK vzkSNARK;

    address public admin;
    mapping(address => uint[2]) public publicKeys;
    mapping(address => uint[2]) public encryptedVotes;
    mapping(address => bool) public refunded;
    address[] public voters;
    uint public constant nVoters = __NVOTERS__;
    uint[] public encryptedVotesXsign = __XSIGN__;
    bytes32 public usersMerkleTreeRoot;
    uint public finishRegistartionBlockNumber;
    uint public finishVotingBlockNumber;
    uint public finishTallyBlockNumber;
    uint public voteResult;
    uint public constant pm1d2 =
        10944121435919637611123202872628637544274182200208017171849102093287904247808;

    constructor(
        address _verifierMerkleTreeAddress,
        address _verifierZKSNARKAddress,
        bytes32 _usersMerkleTreeRoot,
        uint _registrationBlockInterval,
        uint _votingBlockInterval,
        uint _tallyBlockInterval
    ) payable {
        vMerkleProof = verifierMerkleTree(_verifierMerkleTreeAddress);
        vzkSNARK = verifierZKSNARK(_verifierZKSNARKAddress);
        admin = msg.sender;
        usersMerkleTreeRoot = _usersMerkleTreeRoot;
        finishRegistartionBlockNumber =
            block.number +
            _registrationBlockInterval;
        finishVotingBlockNumber =
            finishRegistartionBlockNumber +
            _votingBlockInterval;
        finishTallyBlockNumber = finishVotingBlockNumber + _tallyBlockInterval;
    }

    function register(
        address sender,
        uint8 v,
        uint r,
        uint s,
        uint[] memory _pubKey,
        uint[2] memory proof_a,
        uint[2][2] memory proof_b,
        uint[2] memory proof_c,
        bytes32[] memory _merkleProof
    ) public payable {
        require(
            block.number < finishRegistartionBlockNumber,
            "Registration phase is already closed"
        );
        require(
            vzkSNARK.verifyProof(proof_a, proof_b, proof_c, _pubKey, 0),
            "Invalid DL proof"
        );
        checkRegistering(sender, v, r, s, _pubKey, proof_a, proof_b, proof_c);

        if (publicKeys[sender][0] == 0 && publicKeys[sender][1] == 0) {
            require(
                voters.length + 1 <= nVoters,
                "Max number of voters is reached"
            );
            require(
                vMerkleProof.verifyProof(
                    _merkleProof,
                    usersMerkleTreeRoot,
                    keccak256(abi.encodePacked(sender))
                ),
                "Invalid Merkle proof"
            );
            voters.push(sender);
        }
        publicKeys[sender] = [_pubKey[0], _pubKey[1]];
    }

    function castVote(
        address sender,
        uint8 v,
        uint r,
        uint s,
        uint[2] memory _encryptedVote,
        uint _Idx,
        uint[2] memory proof_a,
        uint[2][2] memory proof_b,
        uint[2] memory proof_c
    ) public {
        require(
            block.number >= finishRegistartionBlockNumber &&
                block.number < finishVotingBlockNumber,
            "Voting phase is already closed"
        );
        require(sender == voters[_Idx], "Unregistered voter");

        checkVoting(
            sender,
            v,
            r,
            s,
            _encryptedVote,
            _Idx,
            proof_a,
            proof_b,
            proof_c
        );

        uint[] memory _publicSignals = new uint[](nVoters + 3);
        _publicSignals[0] = _encryptedVote[0];
        _publicSignals[1] = _encryptedVote[1];
        for (uint i = 0; i < voters.length; i++) {
            _publicSignals[i + 2] = publicKeys[voters[i]][1];
        }
        if (voters.length < nVoters) {
            for (uint i = voters.length; i < nVoters; i++) {
                _publicSignals[i + 2] = 1;
            }
        }
        _publicSignals[_publicSignals.length - 1] = _Idx;

        require(
            vzkSNARK.verifyProof(proof_a, proof_b, proof_c, _publicSignals, 1),
            "Invalid encrypted vote"
        );

        encryptedVotes[sender] = _encryptedVote;

        if (_encryptedVote[0] >= pm1d2) {
            encryptedVotesXsign[_Idx / 253] ^= 1 << (_Idx % 253);
        }
    }

    function setTally(
        uint _result,
        uint[2] memory proof_a,
        uint[2][2] memory proof_b,
        uint[2] memory proof_c
    ) public {
        require(msg.sender == admin, "Only admin can set the tally result");
        require(
            block.number >= finishVotingBlockNumber &&
                block.number < finishTallyBlockNumber,
            "Tallying phase is already closed"
        );

        uint[] memory _publicSignals = new uint[](
            nVoters + encryptedVotesXsign.length + 1
        );
        _publicSignals[0] = _result;
        uint offset = 1;
        for (uint i = 0; i < encryptedVotesXsign.length; i++) {
            _publicSignals[i + offset] = encryptedVotesXsign[i];
        }
        offset += encryptedVotesXsign.length;
        for (uint i = 0; i < voters.length; i++) {
            _publicSignals[i + offset] = encryptedVotes[voters[i]][1];
        }
        if (voters.length < nVoters) {
            for (uint i = voters.length; i < nVoters; i++) {
                _publicSignals[i + offset] = 1;
            }
        }
        require(
            vzkSNARK.verifyProof(proof_a, proof_b, proof_c, _publicSignals, 2),
            "Invalid Tallying Result"
        );
        voteResult = _result;
    }

    function checkRegistering(
        address sender,
        uint8 v,
        uint r,
        uint s,
        uint[] memory _pubKey,
        uint[2] memory proof_a,
        uint[2][2] memory proof_b,
        uint[2] memory proof_c
    ) public pure returns (bool) {
        bytes32 inputMessageHash = hashRegisterArguments(
            sender,
            _pubKey,
            proof_a,
            proof_b,
            proof_c
        );

        bytes32 formattedMessageHash = formatAndHashMessage(inputMessageHash);
        return sender == recoverSigner(formattedMessageHash, v, bytes32(r), bytes32(s));
    }

    function checkVoting(
        address sender,
        uint8 v,
        uint r,
        uint s,
        uint[2] memory _encryptedVote,
        uint _Idx,
        uint[2] memory proof_a,
        uint[2][2] memory proof_b,
        uint[2] memory proof_c
    ) public pure returns (bool) {
        bytes32 inputMessageHash = hashVoteArguments(
            sender,
            _encryptedVote,
            proof_a,
            proof_b,
            proof_c,
            _Idx
        );
        bytes32 formattedMessageHash = formatAndHashMessage(inputMessageHash);
        return sender == recoverSigner(formattedMessageHash, v, bytes32(r), bytes32(s));

        return true;
    }

    function registerHash(
        address sender,
        uint[] memory _pubKey,
        uint[2] memory proof_a,
        uint[2][2] memory proof_b,
        uint[2] memory proof_c
    ) public pure returns (bytes32 inputMessageHash) {
        inputMessageHash = hashRegisterArguments(
            sender,
            _pubKey,
            proof_a,
            proof_b,
            proof_c
        );
    }

    function votingHash(
        address sender,
        uint[2] memory _encryptedVote,
        uint _Idx,
        uint[2] memory proof_a,
        uint[2][2] memory proof_b,
        uint[2] memory proof_c
    ) public pure returns (bytes32 inputMessageHash) {
        inputMessageHash = hashVoteArguments(
            sender,
            _encryptedVote,
            proof_a,
            proof_b,
            proof_c,
            _Idx
        );
    }
}
