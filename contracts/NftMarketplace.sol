// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;
import "@openzeppelin/contracts/access/Ownable.sol";
import "./Nft.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

error NftMarketplace__InsufficientFunds();
error NftMarketplace__IncorrectPrice();
error NftMarketplace__Unauthorized();
error NftMarketplace__NoPriceSetForListing();
error NftMarketplace__ItemAlreadyListed(uint256 nftId, address nftAddress);
error NftMarketplace__ItemNotListed(uint256 nftId, address nftAddress);
error NftMarketplace__NotApprovedForMarketplace();
error NftMarketplace__SellerCannotBeBuyer();
error NftMarketplace__NoProceedingsToWithdraw(address);

contract NftMarketplace is Ownable, ReentrancyGuard {
    struct Listing {
        uint256 price;
        address seller;
    }

    uint256 immutable i_mintingFee;

    uint16 private constant REQUEST_CONFIRMATIONS = 3;
    uint32 private constant NUM_WORDS = 1;

    Nft private nftContract;
    mapping(uint256 => address) public s_requestIdToSender;
    mapping(address => mapping(uint256 => Listing)) private s_listings;

    mapping(address => uint256) private s_proceedings;

    event NftRequested(address requester);
    event NftMinted(address owner, uint256 tokenId);
    event NftListed(uint256 nftId, address owner, uint256 price, address ierc721TokenAddress);
    event NftSold(address owner, uint256 nftId, address ierc721TokenAddress, uint256 price);
    event NftListingUpdated(
        uint256 nftId,
        address owner,
        uint256 price,
        address ierc721TokenAddress
    );
    event NftListingCancelled(uint256 nftId, address owner, address ierc721TokenAddress);

    constructor(address nftContractAddress, uint256 mintingFee) {
        nftContract = Nft(nftContractAddress);
        i_mintingFee = mintingFee;
    }

    function gatekeep() external payable {
        if (msg.value < i_mintingFee) {
            revert NftMarketplace__InsufficientFunds();
        }
        emit NftRequested(msg.sender);
    }

    function mintNft(string memory ipfsHash, address owner) external onlyOwner {
        uint256 tokenId = nftContract.mint(owner, ipfsHash);
        emit NftMinted(owner, tokenId);
    }

    function buyNft(uint256 nftId, address ierc721TokenAddress)
        public
        payable
        isListed(nftId, ierc721TokenAddress)
        nonReentrant
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
            revert NftMarketplace__NoProceedingsToWithdraw(msg.sender);
        }

        delete s_proceedings[msg.sender];
        (bool success, ) = payable(msg.sender).call{value: senderProceedings}("");
        require(success, "Withdraw failed");
    }

    function listNft(
        uint256 nftId,
        address ierc721TokenAddress,
        uint256 price
    ) public payable isOwner(nftId, ierc721TokenAddress) notListed(nftId, ierc721TokenAddress) {
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
    )
        public
        payable
        isOwner(nftId, ierc721TokenAddress)
        isListed(nftId, ierc721TokenAddress)
        nonReentrant
    {
        if (price <= 0) {
            revert NftMarketplace__NoPriceSetForListing();
        }
        s_listings[ierc721TokenAddress][nftId].price = price;
        emit NftListingUpdated(nftId, msg.sender, price, ierc721TokenAddress);
    }

    function cancelListing(uint256 nftId, address ierc721TokenAddress)
        public
        isOwner(nftId, ierc721TokenAddress)
        isListed(nftId, ierc721TokenAddress)
    {
        delete s_listings[ierc721TokenAddress][nftId];
        emit NftListingCancelled(nftId, msg.sender, ierc721TokenAddress);
    }

    function getMintingFee() public view returns (uint256) {
        return i_mintingFee;
    }

    modifier isOwner(uint256 nftId, address ierc721TokenAddress) {
        IERC721 nft = IERC721(ierc721TokenAddress);
        if (msg.sender != nft.ownerOf(nftId)) {
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
