// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface IERC5192 {
    event Locked(uint256 tokenId);

    function locked(uint256 tokenId) external view returns (bool);
}

contract TrustPaySBT is ERC721URIStorage, Ownable, IERC5192 {
    uint256 private _tokenIdCounter;

    mapping(address => uint256) public studentToken;
    mapping(uint256 => bool) private _exists;

    event ReceiptMinted(
        address indexed student,
        uint256 tokenId,
        string ipfsCID
    );

    constructor() ERC721("TrustPay Receipt", "TPAY") Ownable(msg.sender) {}

    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal override returns (address) {
        address from = _ownerOf(tokenId);
        if (from != address(0)) {
            revert("SBT: NonTransferable");
        }
        return super._update(to, tokenId, auth);
    }

    function locked(uint256 tokenId) external view override returns (bool) {
        require(_exists[tokenId], "Token does not exist");
        return true;
    }

    function mintReceipt(
        address student,
        string memory ipfsCID
    ) external onlyOwner returns (uint256) {
        require(student != address(0), "Invalid address");
        require(studentToken[student] == 0, "Receipt already issued");

        // ← Plain increment instead of Counters
        _tokenIdCounter++;
        uint256 newTokenId = _tokenIdCounter;

        _safeMint(student, newTokenId);
        _setTokenURI(newTokenId, string(abi.encodePacked("ipfs://", ipfsCID)));

        studentToken[student] = newTokenId;
        _exists[newTokenId] = true;

        emit Locked(newTokenId);
        emit ReceiptMinted(student, newTokenId, ipfsCID);

        return newTokenId;
    }

    function hasReceipt(address student) external view returns (bool) {
        return studentToken[student] != 0;
    }

    function getTokenId(address student) external view returns (uint256) {
        return studentToken[student];
    }
}
