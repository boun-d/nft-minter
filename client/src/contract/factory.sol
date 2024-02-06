// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/introspection/ERC165Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/StringsUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/utils/math/SafeMath.sol";

import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC721/IERC721Receiver.sol";

library Base64 {
    string internal constant TABLE =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

    function encode(bytes memory data) internal pure returns (string memory) {
        if (data.length == 0) return "";

        // load the table into memory
        string memory table = TABLE;

        // multiply by 4/3 rounded up
        uint256 encodedLen = 4 * ((data.length + 2) / 3);

        // add some extra buffer at the end required for the writing
        string memory result = new string(encodedLen + 32);

        assembly {
        // set the actual output length
            mstore(result, encodedLen)

        // prepare the lookup table
            let tablePtr := add(table, 1)

        // input ptr
            let dataPtr := data
            let endPtr := add(dataPtr, mload(data))

        // result ptr, jump over length
            let resultPtr := add(result, 32)

        // run over the input, 3 bytes at a time
            for {

            } lt(dataPtr, endPtr) {

            } {
                dataPtr := add(dataPtr, 3)

            // read 3 bytes
                let input := mload(dataPtr)

            // write 4 characters
                mstore(
                resultPtr,
                shl(248, mload(add(tablePtr, and(shr(18, input), 0x3F))))
                )
                resultPtr := add(resultPtr, 1)
                mstore(
                resultPtr,
                shl(248, mload(add(tablePtr, and(shr(12, input), 0x3F))))
                )
                resultPtr := add(resultPtr, 1)
                mstore(
                resultPtr,
                shl(248, mload(add(tablePtr, and(shr(6, input), 0x3F))))
                )
                resultPtr := add(resultPtr, 1)
                mstore(
                resultPtr,
                shl(248, mload(add(tablePtr, and(input, 0x3F))))
                )
                resultPtr := add(resultPtr, 1)
            }

        // padding with '='
            switch mod(mload(data), 3)
            case 1 {
                mstore(sub(resultPtr, 2), shl(240, 0x3d3d))
            }
            case 2 {
                mstore(sub(resultPtr, 1), shl(248, 0x3d))
            }
        }

        return result;
    }
}


contract NftFactory {

    event CollectionCreated(address indexed _newCollection);

    address[] contracts;

    // useful to know the row count in contracts index

    function getContractCount() public view returns (uint256 contractCount) {
        return contracts.length;
    }

    // deploy a new contract

    function newCollection(
        string memory collectionName,
        uint256 collectionSize,
        address royalties1,
        uint256 firstAmount,
        address royalties2,
        uint256 secondAmount,
        string memory baseU,
        address[] memory whiteAddresses
    ) public returns (address newContract) {
        address firstRoyalties;
        address secondRoyalties;
        uint256 amount1;
        uint256 amount2;
        firstRoyalties = royalties1;
        secondRoyalties = royalties2;
        amount1 = firstAmount;
        amount2 = secondAmount;
        if (firstAmount == 0) {
            firstRoyalties = address(0);
            amount1 = 0;
        }
        if (secondAmount == 0) {
            secondRoyalties = address(0);
            amount2 = 0;
        }
        if (firstAmount > 100) {
            amount1 = 100;
        }
        if (secondAmount > 100) {
            amount2 = 100;
        }

        NftMinter c = new NftMinter(
            collectionName,
            collectionSize,
            msg.sender,
            firstRoyalties,
            amount1,
            secondRoyalties,
            amount2,
            baseU,
            whiteAddresses
        );
        contracts.push(address(c));
        emit CollectionCreated(address(c));
        return address(c);
    }

    function getNftCollectionSize(address collectionAddress)
    public
    view
    returns (uint256)
    {
        return NftMinter(collectionAddress).getCollectionSize();
    }

    function getCollectionName(address collectionAddress)
    public
    view
    returns (string memory)
    {
        return NftMinter(collectionAddress).getCollectionName();
    }

    function mintNft(address collectionAddress) public {
        NftMinter(collectionAddress).mint(msg.sender);
    }

    function airdropNft(address collectionAddress, address holder, uint256 id) public {
        NftMinter(collectionAddress).airdrop(msg.sender,holder,id);
    }

    function getNftRemaingNfts(address collectionAddress)
    public
    view
    returns (uint256)
    {
        return NftMinter(collectionAddress).getRemainingNfts();
    }

    function getRoyaltiesInfo(
        address collectionAddress,
        uint256 tokenId,
        uint256 salePrice
    )
    public
    view
    returns (
        address receiver,
        uint256 royaltyAmount,
        address receiver2,
        uint256 royaltyAmount2
    )
    {
        return NftMinter(collectionAddress).royaltyInfo(tokenId, salePrice);
    }

    function collectionOwner(address collectionAddress)
    public
    view
    returns (address)
    {
        return NftMinter(collectionAddress).owner();
    }

    function nftOwner(address collectionAddress, uint256 id)
    public
    view
    returns (address)
    {
        return NftMinter(collectionAddress).nftOwnerOf(id);
    }

    function getDeploy(address collectionAddress) public returns (uint256) {
        return NftMinter(collectionAddress).getDeployedDate();
    }

    function getDeployTwoDays(address collectionAddress)
    public
    returns (uint256)
    {
        return NftMinter(collectionAddress).getTwoDaysFromDeployment();
    }


    function approve(
        address collectionAddress,
        address to,
        uint256 tokenId
    ) public {
        NftMinter(collectionAddress).approve(to, tokenId);
    }
}

contract NftMinter is Initializable, ERC721Upgradeable {
    uint256 private _collecitonSize = 0;
    uint256 private _remainingNfts = 0;
    address private _owner;
    string private baseURI;
    string private collectionName = "";
    address private firstRoylatiesAddrress = address(0);
    address private secondRoyaltiesAddress = address(0);
    mapping(uint256 => uint256) public store;
    mapping(uint256 => uint256) public smallStore;
    mapping(address => uint256) royalties;
    using SafeMath for uint256;
    mapping(address => bool) whitelist;
    uint256 deployedDate;
    bool whitelistPopulated;
    modifier checkRemaining() {
        require(_remainingNfts > 0, "Collection size max reached");
        _;
    }

    modifier whitelisted(address mintFor) {
        if (whitelistPopulated) {
            require(whitelist[mintFor], "Not in whitelist");
        }
        _;
    }

    modifier twoDaysTimer() {
        if (whitelistPopulated) {
            uint256 two = this.getTwoDaysFromDeployment();
            require(block.timestamp > two, "Less than two days");
        }
        _;
    }

    modifier onlyOwner(address caller) {
        require(
            owner() == caller,
            "Only the owner can call this function."
        );
        _;
    }

    function owner() public view returns (address) {
        return _owner;
    }

    constructor(
        string memory name,
        uint256 collectionSize,
        address deployer,
        address royalties1,
        uint256 firstAmount,
        address royalties2,
        uint256 secondAmount,
        string memory baseUri,
        address[] memory whitelistedAddresses
    ) {
        collectionName = name;
        setSizeAndRemaing(collectionSize);
        _owner = deployer;
        firstRoylatiesAddrress = royalties1;
        secondRoyaltiesAddress = royalties2;
        royalties[firstRoylatiesAddrress] = firstAmount;
        royalties[secondRoyaltiesAddress] = secondAmount;
        deployedDate = block.timestamp;
        if (whitelistedAddresses.length > 0) {
            whitelistPopulated = true;
        }
        baseURI = baseUri;
        uint256 whitelistLength = whitelistedAddresses.length;
        for (uint256 i = 0; i < whitelistLength; i++) {
            whitelist[whitelistedAddresses[i]] = true;
        }
    }

    function getDeployedDate() public view returns (uint256) {
        return deployedDate;
    }

    function getTwoDaysFromDeployment() public view returns (uint256) {
        return deployedDate + 2 * 1 days;
    }

    function tokenURI(uint256 tokenId)
    public
    view
    virtual
    override
    returns (string memory)
    {
        return
        string(
            abi.encodePacked(
                "ipfs://",
                baseURI,
                "/",
                Strings.toString(tokenId)
            )
        );
    }

    function getCollectionSize() public view returns (uint256) {
        return _collecitonSize;
    }

    function getCollectionName() public view returns (string memory) {
        return collectionName;
    }

    function getRemainingNfts() public view returns (uint256) {
        return _remainingNfts;
    }

    function setSizeAndRemaing(uint256 newCollectionSize) public {
        _collecitonSize = newCollectionSize;
        _remainingNfts = newCollectionSize;
    }

    function mint(address to)
    public
    checkRemaining
    whitelisted(to)
    twoDaysTimer
    {
        uint256 id = randomId();
        _safeMint(to, id);
    }

    function nftOwnerOf(uint256 id) public view returns (address) {
        return ownerOf(id);
    }

    function royaltyInfo(uint256 _tokenId, uint256 salePrice)
    external
    view
    returns (
        address receiver,
        uint256 royaltyAmount,
        address receiver2,
        uint256 royaltyAmount2
    )
    {
        uint256 firstReturnAmount;
        uint256 secondReturnAmount;

        firstReturnAmount = salePrice
        .mul(royalties[firstRoylatiesAddrress])
        .div(100);

        secondReturnAmount = salePrice
        .mul(royalties[secondRoyaltiesAddress])
        .div(100);

        return (
        firstRoylatiesAddrress,
        firstReturnAmount,
        secondRoyaltiesAddress,
        secondReturnAmount
        );
    }

    function randomId() public returns (uint256 newId) {
        uint256 firstNum = uint256(
            keccak256(abi.encodePacked(block.timestamp))
        ) % _remainingNfts;
        newId = store[firstNum] == 0 ? firstNum : store[firstNum];
        store[firstNum] = store[_remainingNfts - 1] == 0
        ? _remainingNfts - 1
        : store[_remainingNfts - 1];
        smallStore[store[firstNum]] = firstNum + 1;
        _remainingNfts = _remainingNfts - 1;
    }

    function airdrop(address caller, address holder, uint256 id) public onlyOwner(caller) checkRemaining {
        _safeMint(holder, id);
        _remainingNfts = _remainingNfts - 1;
    }
}