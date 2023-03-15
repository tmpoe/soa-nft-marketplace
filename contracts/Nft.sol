// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract Nft is ERC721URIStorage {
    mapping(uint256 => address) public s_requestIdToSender;

    using Counters for Counters.Counter;
    Counters.Counter private _tokenIdCounter;

    constructor() ERC721("MyToken", "MTK") {}

    function mint(address owner, string memory tokenUri) public payable returns (uint256 tokenId) {
        tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(owner, tokenId);
        _setTokenURI(tokenId, tokenUri);
        return tokenId;
    }

    function getTokenCounter() public view returns (uint256) {
        return _tokenIdCounter.current();
    }
}
