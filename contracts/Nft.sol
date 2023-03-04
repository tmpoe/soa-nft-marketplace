// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

error Nft__InsufficientFunds();

contract Nft is ERC721 {
    uint256 immutable i_mintingFee;
    event NftMinted(address owner);

    using Counters for Counters.Counter;
    Counters.Counter private _tokenIdCounter;

    constructor(uint256 mintingFee) ERC721("MyToken", "MTK") {
        i_mintingFee = mintingFee;
    }

    function mint() public payable {
        if (msg.value < i_mintingFee) {
            revert Nft__InsufficientFunds();
        }

        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(msg.sender, tokenId);
        emit NftMinted(msg.sender);
    }

    function getMintingFee() public view returns (uint256) {
        return i_mintingFee;
    }
}
