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

    // CHANGED: a wallet can now hold MANY tokens — track them as an array
    mapping(address => uint256[]) public studentTokens;

    // NEW: prevents the same payment from ever being minted twice
    mapping(string => bool) public usedTransactionRefs;

    // CHANGED: maps a transactionRef to its tokenId, for lookups
    mapping(string => uint256) public transactionRefToToken;

    mapping(uint256 => bool) private _exists;

    event ReceiptMinted(
        address indexed student,
        uint256 tokenId,
        string ipfsCID,
        string transactionRef
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

    // CHANGED: now takes a transactionRef as the uniqueness key, not the wallet
    function mintReceipt(
        address student,
        string memory ipfsCID,
        string memory transactionRef
    ) external onlyOwner returns (uint256) {
        require(student != address(0), "Invalid address");
        require(
            !usedTransactionRefs[transactionRef],
            "Receipt already issued for this payment"
        );

        _tokenIdCounter++;
        uint256 newTokenId = _tokenIdCounter;

        _safeMint(student, newTokenId);
        _setTokenURI(newTokenId, string(abi.encodePacked("ipfs://", ipfsCID)));

        studentTokens[student].push(newTokenId);
        usedTransactionRefs[transactionRef] = true;
        transactionRefToToken[transactionRef] = newTokenId;
        _exists[newTokenId] = true;

        emit Locked(newTokenId);
        emit ReceiptMinted(student, newTokenId, ipfsCID, transactionRef);

        return newTokenId;
    }

    // CHANGED: now returns true/count based on whether THIS payment was minted
    function hasReceiptForPayment(
        string memory transactionRef
    ) external view returns (bool) {
        return usedTransactionRefs[transactionRef];
    }

    // NEW: get every receipt a student has ever received
    function getStudentTokens(
        address student
    ) external view returns (uint256[] memory) {
        return studentTokens[student];
    }

    // NEW: get total number of receipts a student holds
    function getReceiptCount(address student) external view returns (uint256) {
        return studentTokens[student].length;
    }
}
