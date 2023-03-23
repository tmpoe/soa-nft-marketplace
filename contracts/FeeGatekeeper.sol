// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

// add pause logic
error FeeGatekeeper__InsufficientFunds();

contract FeeGatekeeper is Ownable, Pausable {
    address s_nftMarketplaceAddress;
    uint256 s_fee;

    constructor(address nftMarketplaceAddress) {
        s_nftMarketplaceAddress = nftMarketplaceAddress;
    }

    function gatekeepMinting() external payable whenNotPaused {
        if (msg.value < s_fee) {
            revert FeeGatekeeper__InsufficientFunds();
        }
        payable(s_nftMarketplaceAddress).transfer(msg.value);
    }

    function getNftMarketplaceAddress() public view returns (address) {
        return s_nftMarketplaceAddress;
    }

    function setNftMarketplaceAddress(address newNftMarketplaceAddress) public onlyOwner {
        s_nftMarketplaceAddress = newNftMarketplaceAddress;
    }
}
