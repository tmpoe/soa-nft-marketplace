// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;
import "@openzeppelin/contracts/access/Ownable.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "./Nft.sol";

error NftMarketplace__InsufficientFunds();
error NftMarketplace__Unauthorized();

contract NftMarketplace is Ownable, VRFConsumerBaseV2 {
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

    Nft private nftContract;
    mapping(uint256 => address) public s_requestIdToSender;

    event NftRequested(uint256 requestId, address requester);
    event NftMinted(address owner, Breed breed);
    event NftListed(uint256 nftId, address owner, uint256 price);

    constructor(
        address nftContractAddress,
        uint256 mintingFee,
        address vrfCoordinatorV2,
        uint64 subscriptionId,
        bytes32 gasLane,
        uint32 callbackGasLimit
    ) VRFConsumerBaseV2(vrfCoordinatorV2) {
        i_mintingFee = mintingFee;
        i_subscriptionId = subscriptionId;
        i_vrfCoordinator = VRFCoordinatorV2Interface(vrfCoordinatorV2);
        i_gasLane = gasLane;
        i_callbackGasLimit = callbackGasLimit;
        nftContract = Nft(nftContractAddress);
    }

    function requestNft() public payable returns (uint256 requestId) {
        if (msg.value < i_mintingFee) {
            revert NftMarketplace__InsufficientFunds();
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
        uint256 breed = randomWords[0] % 3;
        nftContract.mint(breed, owner);
        emit NftMinted(owner, Breed(breed));
    }

    function listNft(uint256 nftId) public payable onlyNftOwner(nftId) {
        emit NftListed(nftId, msg.sender, msg.value);
    }

    modifier onlyNftOwner(uint256 nftId) {
        if (msg.sender != nftContract.ownerOf(nftId)) {
            revert NftMarketplace__Unauthorized();
        }
        _;
    }

    function getMintingFee() public view returns (uint256) {
        return i_mintingFee;
    }
}
