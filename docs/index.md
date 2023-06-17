# Solidity API

## SignatureVerifier

This contract verifies signatures

### BUY_TYPEHASH

```solidity
bytes32 BUY_TYPEHASH
```

The Buy methods typehash

### SignatureVerified

```solidity
event SignatureVerified(uint256 id, uint256 timestamp, address buyer)
```

Emit an event when a signature is verified

### SignatureAlreadyUsed

```solidity
error SignatureAlreadyUsed(bytes signature)
```

Error definitions

### InvalidSigner

```solidity
error InvalidSigner(address recovered, address expected)
```

### SignatureExpired

```solidity
error SignatureExpired(uint256 expirationTime)
```

### InvalidNonce

```solidity
error InvalidNonce(uint256 expected, uint256 actual)
```

### constructor

```solidity
constructor() public
```

Constructor

_Sets the domain and the version of the signature
The domain and the version are used to verify the signature_

### verifySignature

```solidity
function verifySignature(struct MethodTypes.BuyType _buyType, bytes _signature) public
```

Verifies the signature of the buy method

_The signature is verified by using EIP712_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _buyType | struct MethodTypes.BuyType | the buy method type which is defined in MethodTypes.sol |
| _signature | bytes | the signature of the buy method |

### getNonce

```solidity
function getNonce(address wallet) public view returns (uint256)
```

Returns the nonce of the given wallet

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| wallet | address | the wallet address |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | nonce |

## MethodTypes

### BuyType

```solidity
struct BuyType {
  uint256 id;
  uint256 timestamp;
  address buyer;
  uint256 nonce;
}
```

