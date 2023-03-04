// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

contract Nft {
    event NftMinted(address owner);

    function mint() public {
        emit NftMinted(msg.sender);
    }
}
