// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import '@openzeppelin/contracts/utils/cryptography/ECDSA.sol';
import '@openzeppelin/contracts/utils/cryptography/EIP712.sol';
import './lib/MethodTypes.sol';

/**
 * @author Tunahan Dağ
 * @title SignatureVerification
 * @notice This contract verifies signatures
 */
contract SignatureVerifier is EIP712 {
	/// EIP712 SIGNING_DOMAIN definition
	string private constant SIGNING_DOMAIN = 'Verifier';
	/// EIP712 SIGNATURE_VERSION definition
	string private constant SIGNATURE_VERSION = '1';
	/// The Buy methods typehash
	bytes32 public constant BUY_TYPEHASH =
		keccak256(bytes('Buy(uint256 id,uint256 timestamp,address buyer,uint256 nonce)'));
	/// store used signatures to avoid replay attacks
	mapping(bytes => bool) private usedSignatures;
	/// store nonces to avoid replay attacks
	mapping(address => uint256) private nonces;

	/// Emit an event when a signature is verified
	event SignatureVerified(uint256 id, uint256 timestamp, address buyer);

	/// Error definitions
	error SignatureAlreadyUsed();
	error InvalidSigner();
	error SignatureExpired();

	/**
	 * @notice Constructor
	 * @dev Sets the domain and the version of the signature
	 * @dev The domain and the version are used to verify the signature
	 */
	constructor() EIP712(SIGNING_DOMAIN, SIGNATURE_VERSION) {}

	/**
	 * @notice Verifies the signature of the buy method
	 * @dev The signature is verified by using EIP712
	 * @param _buyType the buy method type which is defined in MethodTypes.sol
	 * @param _signature the signature of the buy method
	 */
	function verifySignature(MethodTypes.BuyType memory _buyType, bytes memory _signature) public {
		if (usedSignatures[_signature]) revert SignatureAlreadyUsed();
		if (_buyType.timestamp < block.timestamp) revert SignatureExpired();

		bytes32 digest = _hashTypedDataV4(
			keccak256(
				abi.encode(
					BUY_TYPEHASH,
					_buyType.id,
					_buyType.timestamp,
					_buyType.buyer,
					_buyType.nonce
				)
			)
		);
		address recoveredAddress = ECDSA.recover(digest, _signature);
		if (recoveredAddress != _buyType.buyer) revert InvalidSigner();

		usedSignatures[_signature] = true;
		nonces[_buyType.buyer]++;

		emit SignatureVerified(_buyType.id, _buyType.timestamp, _buyType.buyer);
	}

	/**
	 * @notice Returns the nonce of the given wallet
	 * @param wallet the wallet address
	 * @return nonce
	 */
	function getNonce(address wallet) public view returns (uint256) {
		return nonces[wallet];
	}
}
