// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28; // Match your config version

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TrustPaySBT is ERC721URIStorage, Ownable {
    uint256 private _nextTokenId;

    event Locked(uint256 tokenId);

    constructor(
        address initialOwner
    ) ERC721("TrustPay Receipt", "TPSBT") Ownable(initialOwner) {}

    function safeMint(address to, string memory uri) public onlyOwner {
        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri); // This stores the IPFS link!
        emit Locked(tokenId);
    }

    // SOULBOUND LOCK
    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal override returns (address) {
        address from = _ownerOf(tokenId);
        if (from != address(0) && to != address(0)) {
            revert(
                "TrustPay: This receipt is Soulbound and cannot be transferred."
            );
        }
        return super._update(to, tokenId, auth);
    }
}
