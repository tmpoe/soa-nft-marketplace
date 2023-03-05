// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract Nft is ERC721URIStorage {
    string[3] internal s_tokenUris;

    mapping(uint256 => address) public s_requestIdToSender;

    using Counters for Counters.Counter;
    Counters.Counter private _tokenIdCounter;

    constructor(string[3] memory tokenUris) ERC721("MyToken", "MTK") {
        s_tokenUris = tokenUris;
    }

    function mint(uint256 _type, address owner) public payable returns (uint256 tokenId) {
        tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(owner, tokenId);
        _setTokenURI(tokenId, s_tokenUris[_type]);
        return tokenId;
    }

    function getTokenCounter() public view returns (uint256) {
        return _tokenIdCounter.current();
    }
}
