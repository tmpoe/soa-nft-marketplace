// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";

error Nft__InsufficientFunds();

contract Nft is ERC721, VRFConsumerBaseV2 {
    enum Breed {
        Ragdoll,
        Sphynx,
        Persian
    }

    uint256 immutable i_mintingFee;

    VRFCoordinatorV2Interface private immutable i_vrfCoordinator;
    uint64 private immutable i_subscriptionId;
    bytes32 private immutable i_gasLane;
    uint32 private immutable i_callbackGasLimit;
    uint16 private constant REQUEST_CONFIRMATIONS = 3;
    uint32 private constant NUM_WORDS = 1;

    mapping(uint256 => address) public s_requestIdToSender;

    event NftRequested(uint256 requestId, address requester);
    event NftMinted(address owner, Breed breed);

    using Counters for Counters.Counter;
    Counters.Counter private _tokenIdCounter;

    constructor(
        uint256 mintingFee,
        address vrfCoordinatorV2,
        uint64 subscriptionId,
        bytes32 gasLane,
        uint32 callbackGasLimit
    ) ERC721("MyToken", "MTK") VRFConsumerBaseV2(vrfCoordinatorV2) {
        i_mintingFee = mintingFee;
        i_subscriptionId = subscriptionId;
        i_vrfCoordinator = VRFCoordinatorV2Interface(vrfCoordinatorV2);
        i_gasLane = gasLane;
        i_callbackGasLimit = callbackGasLimit;
    }

    function requestNft() public payable returns (uint256 requestId) {
        if (msg.value < i_mintingFee) {
            revert Nft__InsufficientFunds();
        }
        requestId = i_vrfCoordinator.requestRandomWords(
            i_gasLane,
            i_subscriptionId,
            REQUEST_CONFIRMATIONS,
            i_callbackGasLimit,
            NUM_WORDS
        );
        s_requestIdToSender[requestId] = msg.sender;
        emit NftRequested(requestId, msg.sender);
    }

    function fulfillRandomWords(uint256 requestId, uint256[] memory randomWords)
        internal
        override
    {
        address owner = s_requestIdToSender[requestId]; // should I delete after query?
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        uint256 breed = randomWords[0] % 3;
        _safeMint(owner, tokenId);
        emit NftMinted(owner, Breed(breed));
    }

    function getMintingFee() public view returns (uint256) {
        return i_mintingFee;
    }

    function getTokenCounter() public view returns (uint256) {
        return _tokenIdCounter.current();
    }
}
