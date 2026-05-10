// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title TrustPaySBT
 * @dev Implements ERC-5192 Soulbound Token standard for University Receipts.
 */

interface IERC5192 {
    event Locked(uint256 tokenId);

    function locked(uint256 tokenId) external view returns (bool);
}

contract TrustPaySBT is ERC721URIStorage, Ownable, IERC5192 {
    uint256 private _nextTokenId;

    // Mapping to track the locking status (Always true for SBTs)
    mapping(uint256 => bool) private _tokenLocked;

    constructor() ERC721("TrustPay Receipt", "TPSBT") Ownable(msg.sender) {}

    /**
     * @dev Implementation of IERC5192.
     * All TrustPay receipts are locked by default.
     */
    function locked(uint256 tokenId) external view override returns (bool) {
        require(_ownerOf(tokenId) != address(0), "Nonexistent token");
        return true;
    }

    /**
     * @notice Mints a new Soulbound Receipt.
     * @param student The wallet address of the student.
     * @param metadataURI The IPFS CID linking to the receipt JSON.
     */
    function mintReceipt(
        address student,
        string memory metadataURI
    ) public onlyOwner returns (uint256) {
        uint256 tokenId = _nextTokenId++;

        _safeMint(student, tokenId);
        _setTokenURI(tokenId, metadataURI);

        _tokenLocked[tokenId] = true;
        emit Locked(tokenId);

        return tokenId;
    }

    /**
     * @dev Overriding transfer functions to prevent movement.
     * This makes the token "Soulbound".
     */
    function transferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public override(ERC721, IERC721) {
        revert("TrustPay: Receipts are Soulbound and non-transferable.");
    }

    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId,
        bytes memory data
    ) public override(ERC721, IERC721) {
        revert("TrustPay: Receipts are Soulbound and non-transferable.");
    }

    // Required for Viem/Ethers to recognize metadata URI support
    function supportsInterface(
        bytes4 interfaceId
    ) public view override(ERC721URIStorage) returns (bool) {
        return
            interfaceId == 0xb45a3c0e || super.supportsInterface(interfaceId);
    }
}
