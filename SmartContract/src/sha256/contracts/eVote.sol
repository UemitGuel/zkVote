// SPDX-License-Identifier: UNLICENSED
pragma solidity^0.8.0;
import './verifier_MerkleTree.sol';
import './verifier_zkSNARK.sol';

contract eVote {
    verifierMerkleTree vMerkleProof;
    verifierZKSNARK vzkSNARK;

    address public admin;
    mapping(address=> uint[2]) public publicKeys;
    mapping(address=> uint[2]) public encryptedVotes;
    mapping(address=> bool) public refunded;
    address[] public voters;
    uint public constant nVoters = __NVOTERS__;
    bytes32 public usersMerkleTreeRoot;
    uint public finishRegistartionBlockNumber;
    uint public finishVotingBlockNumber;
    uint public finishTallyBlockNumber;
    uint public constant DEPOSIT = 1 ether;
    uint public voteResult;
    uint[] public encryptedVotesXsign = __XSIGN__;
    uint hashVotingKeysY = 0;
    uint constant pm1d2 = 10944121435919637611123202872628637544274182200208017171849102093287904247808;
    uint constant SNARK_SCALAR_FIELD = 21888242871839275222246405745257275088548364400416034343698204186575808495617;
    constructor(
            address _verifierMerkleTreeAddress, 
            address _verifierZKSNARKAddress, 
            bytes32 _usersMerkleTreeRoot, 
            uint _registrationBlockInterval, 
            uint _votingBlockInterval, 
            uint _tallyBlockInterval
        ) payable {
        require(msg.value==DEPOSIT,"Invalid deposit value");
        vMerkleProof = verifierMerkleTree(_verifierMerkleTreeAddress);
        vzkSNARK = verifierZKSNARK(_verifierZKSNARKAddress);
        admin = msg.sender;
        usersMerkleTreeRoot = _usersMerkleTreeRoot;
        finishRegistartionBlockNumber = block.number+_registrationBlockInterval;
        finishVotingBlockNumber = finishRegistartionBlockNumber + _votingBlockInterval;
        finishTallyBlockNumber = finishVotingBlockNumber+_tallyBlockInterval;
    }

    function register(
            uint[] memory _pubKey, 
            uint[2] memory proof_a, 
            uint[2][2] memory proof_b, 
            uint[2] memory proof_c, 
            bytes32[] memory _merkleProof
        ) public payable{
        require(msg.value==DEPOSIT,"Invalid deposit value");
        require(block.number<finishRegistartionBlockNumber,"Registration phase is already closed");
        require(vzkSNARK.verifyProof(proof_a, proof_b, proof_c, _pubKey, 0),"Invalid DL proof");
        if (publicKeys[msg.sender][0] == 0 && publicKeys[msg.sender][1] == 0){
            require(voters.length + 1 <= nVoters, "Max number of voters is reached");
            require(vMerkleProof.verifyProof(_merkleProof, usersMerkleTreeRoot, keccak256(abi.encodePacked(msg.sender))), "Invalid Merkle proof");
            voters.push(msg.sender);
        }
        publicKeys[msg.sender] = [_pubKey[0], _pubKey[1]];
    }
    function castVote(
            uint[2] memory _encryptedVote, 
            uint _Idx, 
            uint[2] memory proof_a, 
            uint[2][2] memory proof_b, 
            uint[2] memory proof_c
        ) public {
        require(block.number >= finishRegistartionBlockNumber && block.number < finishVotingBlockNumber, "Voting phase is already closed");
        require( msg.sender == voters[_Idx], "Unregistered voter");
        
        if (hashVotingKeysY == 0){
            uint[] memory toHash = new uint[](nVoters);
            for(uint i =0; i<voters.length;i++){
                toHash[i] = publicKeys[voters[i]][1];
            }
            if (voters.length < nVoters){
                for(uint i=voters.length; i<nVoters; i++){
                    toHash[i] = 1;
                }
            }
            hashVotingKeysY = uint256(sha256(abi.encodePacked(toHash))) % SNARK_SCALAR_FIELD;
            
        }

        uint[] memory _publicSignals = new uint[](4);
        _publicSignals[0] = hashVotingKeysY;
        _publicSignals[1] = _encryptedVote[0];
        _publicSignals[2] = _encryptedVote[1];
        _publicSignals[3] = _Idx;
        
        require(vzkSNARK.verifyProof(proof_a, proof_b, proof_c, _publicSignals, 1),"Invalid encrypted vote");

        encryptedVotes[msg.sender] = _encryptedVote;

        if (_encryptedVote[0] >= pm1d2){
            encryptedVotesXsign[_Idx/253] ^= 1<<(_Idx%253);
        }
    }
    function setTally(
            uint _result, 
            uint[2] memory proof_a, 
            uint[2][2] memory proof_b, 
            uint[2] memory proof_c
        ) public {
        require(msg.sender==admin,"Only admin can set the tally result");
        require(block.number >= finishVotingBlockNumber && block.number < finishTallyBlockNumber, "Tallying phase is already closed");
        
        uint[] memory toHash = new uint[](nVoters + encryptedVotesXsign.length);
        for(uint i=0; i<voters.length; i++){
            toHash[i] = encryptedVotes[voters[i]][1];
        }
        if (voters.length < nVoters){
            for(uint i=voters.length; i<nVoters; i++){
                toHash[i] = 1;
            }
        }    
        for(uint i=0; i<encryptedVotesXsign.length;i++){
            toHash[i + nVoters] = encryptedVotesXsign[i];
        }
        uint hash_encryptedVotesY_SignNumX = uint256(sha256(abi.encodePacked(toHash))) % SNARK_SCALAR_FIELD;

        uint[] memory _publicSignals = new uint[](2);
        _publicSignals[0] = hash_encryptedVotesY_SignNumX;
        _publicSignals[1] = _result;
        require(vzkSNARK.verifyProof(proof_a, proof_b, proof_c, _publicSignals, 2),"Invalid Tallying Result");
        voteResult = _result;
    }
    function refund() public{
        require(block.number >= finishTallyBlockNumber, "Invalid reclaim deposit phase");
        require(refunded[msg.sender] == false && (encryptedVotes[msg.sender][0] != 0 || msg.sender == admin),"Illegal reclaim");
        refunded[msg.sender] = true;
        payable(msg.sender).transfer(DEPOSIT);
    }
    
}