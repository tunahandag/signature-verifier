// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

library MethodTypes {
	struct BuyType {
		uint256 id;
		uint256 timestamp;
		address buyer;
		uint256 nonce;
	}
}
