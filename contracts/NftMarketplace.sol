// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;
import "@openzeppelin/contracts/access/Ownable.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "./Nft.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

error NftMarketplace__InsufficientFunds();
error NftMarketplace__IncorrectPrice();
error NftMarketplace__Unauthorized();
error NftMarketplace__NoPriceSetForListing();
error NftMarketplace__ItemAlreadyListed(uint256 nftId, address nftAddress);
error NftMarketplace__ItemNotListed(uint256 nftId, address nftAddress);
error NftMarketplace__NotApprovedForMarketplace();
error NftMarketplace__SellerCannotBeBuyer();
error NftMarketplace__NoProceedingsToWithdra(address);

contract NftMarketplace is Ownable, VRFConsumerBaseV2 {
    enum Breed {
        Ragdoll,
        Sphynx,
        Persian
    }

    struct Listing {
        uint256 price;
        address seller;
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
    mapping(address => mapping(uint256 => Listing)) private s_listings;

    mapping(address => uint256) private s_proceedings;

    event NftRequested(uint256 requestId, address requester);
    event NftMinted(address owner, Breed breed);
    event NftListed(uint256 nftId, address owner, uint256 price, address ierc721TokenAddress);
    event NftSold(address owner, uint256 nftId, address ierc721TokenAddress, uint256 price);
    event NftListingUpdated(
        uint256 nftId,
        address owner,
        uint256 price,
        address ierc721TokenAddress
    );
    event NftListingCancelled(uint256 nftId, address owner, address ierc721TokenAddress);

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

    function buyNft(uint256 nftId, address ierc721TokenAddress)
        public
        payable
        isListed(nftId, ierc721TokenAddress)
    {
        Listing memory listing = s_listings[ierc721TokenAddress][nftId];
        if (msg.value != listing.price) {
            revert NftMarketplace__IncorrectPrice();
        }
        if (msg.sender == listing.seller) {
            revert NftMarketplace__SellerCannotBeBuyer();
        }

        ERC721 nft = ERC721(ierc721TokenAddress);

        delete s_listings[ierc721TokenAddress][nftId];
        s_proceedings[listing.seller] += msg.value;

        nft.safeTransferFrom(listing.seller, msg.sender, nftId);
        emit NftSold(msg.sender, nftId, ierc721TokenAddress, msg.value);
    }

    function withdrawProceedings() external {
        uint256 senderProceedings = s_proceedings[msg.sender];

        if (senderProceedings <= 0) {
            revert NftMarketplace__NoProceedingsToWithdra(msg.sender);
        }

        delete s_proceedings[msg.sender];
        (bool success, ) = payable(msg.sender).call{value: senderProceedings}("");
        require(success, "Withdraw failed");
    }

    function listNft(
        uint256 nftId,
        address ierc721TokenAddress,
        uint256 price
    ) public payable onlyNftOwner(nftId) notListed(nftId, ierc721TokenAddress) {
        if (price <= 0) {
            revert NftMarketplace__NoPriceSetForListing();
        }
        IERC721 nft = IERC721(ierc721TokenAddress);

        if (nft.getApproved(nftId) != address(this)) {
            revert NftMarketplace__NotApprovedForMarketplace();
        }

        s_listings[ierc721TokenAddress][nftId] = Listing(price, msg.sender);
        emit NftListed(nftId, msg.sender, price, ierc721TokenAddress);
    }

    function updateListing(
        uint256 nftId,
        address ierc721TokenAddress,
        uint256 price
    ) public payable onlyNftOwner(nftId) isListed(nftId, ierc721TokenAddress) {
        if (price <= 0) {
            revert NftMarketplace__NoPriceSetForListing();
        }
        s_listings[ierc721TokenAddress][nftId].price = price;
        emit NftListingUpdated(nftId, msg.sender, price, ierc721TokenAddress);
    }

    function cancelListing(uint256 nftId, address ierc721TokenAddress)
        public
        onlyNftOwner(nftId)
        isListed(nftId, ierc721TokenAddress)
    {
        delete s_listings[ierc721TokenAddress][nftId];
        emit NftListingCancelled(nftId, msg.sender, ierc721TokenAddress);
    }

    function getMintingFee() public view returns (uint256) {
        return i_mintingFee;
    }

    modifier onlyNftOwner(uint256 nftId) {
        if (msg.sender != nftContract.ownerOf(nftId)) {
            revert NftMarketplace__Unauthorized();
        }
        _;
    }

    modifier notListed(uint256 nftId, address ierc721TokenAddress) {
        Listing memory listing = s_listings[ierc721TokenAddress][nftId];
        if (listing.price > 0) {
            revert NftMarketplace__ItemAlreadyListed(nftId, ierc721TokenAddress);
        }
        _;
    }

    modifier isListed(uint256 nftId, address ierc721TokenAddress) {
        Listing memory listing = s_listings[ierc721TokenAddress][nftId];
        if (listing.price <= 0) {
            revert NftMarketplace__ItemNotListed(nftId, ierc721TokenAddress);
        }
        _;
    }
}
