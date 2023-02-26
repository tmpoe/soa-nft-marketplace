pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";

error MyToken__InsufficientFunds();
error MyToken__RngOutOfBounds();

contract MyToken is ERC721, VRFConsumerBaseV2, Ownable {
    enum TokenType {
        Placeholder1,
        Placeholder2,
        Placeholder3
    }

    VRFCoordinatorV2Interface private immutable i_vrfCoordinator;
    uint64 private immutable i_subscriptionId;
    bytes32 private immutable i_gasLane;
    uint32 private immutable i_callbackGasLimit;

    uint16 private constant REQUEST_CONFIRMATIONS = 3;
    uint32 private constant NUM_WORDS = 1;
    uint8 public constant MAX_CHANCE = 100;

    uint256 immutable i_mintFee;
    string[] internal s_tokenUris;

    mapping(uint256 => address) requestIdToMinter;

    event MintingRequested(uint256 requestId, address requester);
    event NftMinted(address owner, string nftType);

    using Counters for Counters.Counter;

    Counters.Counter private _tokenIdCounter;

    constructor(
        uint256 mintFee,
        string[1] memory tokenUris,
        address vrfCoordinatorV2,
        uint64 subscirptionId,
        bytes32 gasLane,
        uint32 callbackGasLimit
    ) VRFConsumerBaseV2(vrfCoordinatorV2) ERC721("MyToken", "MTK") {
        i_mintFee = mintFee;
        s_tokenUris = tokenUris;
        i_vrfCoordinator = VRFCoordinatorV2Interface(vrfCoordinatorV2);
        i_subscriptionId = subscirptionId;
        i_gasLane = gasLane;
        i_callbackGasLimit = callbackGasLimit;
    }

    function _baseURI() internal pure override returns (string memory) {
        return "https://ipfs.io/ipfs/";
    }

    function requestMinting() public payable returns (uint256 requestId) {
        if (msg.value < i_mintFee) {
            revert MyToken__InsufficientFunds();
        }

        requestId = i_vrfCoordinator.requestRandomWords(
            i_gasLane,
            i_subscriptionId,
            REQUEST_CONFIRMATIONS,
            i_callbackGasLimit,
            NUM_WORDS
        );

        requestIdToMinter[requestId] = msg.sender;
        emit MintingRequested(requestId, msg.sender);
    }

    function fulfillRandomWords(uint256 requestId, uint256[] memory randomWords)
        internal
        override
    {
        address owner = requestIdToMinter[requestId];
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();

        uint256 rng = randomWords[0] % MAX_CHANCE;
        TokenType tokenType = _getTokenTypeByChance(rng);
        string tokenUri = s_tokenUris[uint256(tokenType)];

        _safeMint(owner, tokenId);
        _setTokenURI(tokenId, tokenUri);

        emit NftMinted(requestId, tokenType);
    }

    function _getTokenTypeByChance(uint256 rng) private returns (TokenType) {
        uint256 chanceArray = getChanceArray();

        for (uint8 i = 0; i < chanceArray.length; i++) {
            if (rng < chanceArray[i]) {
                return TokenType(i);
            }
        }

        revert MyToken__RngOutOfBounds();
    }

    function getChanceArray() public returns (uint256[3] memory chanceArray) {
        return [1, 20, MAX_CHANCE];
    }

    function safeMint(address to) public onlyOwner {
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(to, tokenId);
    }
}
