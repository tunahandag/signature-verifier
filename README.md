# Signature Verifier

---

_This project is an implementation of EIP712. Signatures are created on a Buy method where the contract verifies the signatures. A dummy nonce manager is implemented in the contract to avoid same nonces being reused._

-   hardhat.config.js is kept simple on purpose (no networks, no gas reporter, etc.)
-   Contract documentation can be found [here](docs/index.md).

## Development Instructions

-   `$ npx hardhat compile` - _Compile smart contract_
-   `$ npx hardhat run scripts/deploy.js` - _Script file for deploy smart contract_
-   `$ npx hardhat node` - _Started HTTP and WebSocket JSON-RPC server at http://127.0.0.1:8545/_
-   `$ npx hardhat --network localhost test` - _Run all tests_
-   `$ npx hardhat docgen` - _Extracts documentation for project_
-   `$ npx hardhat coverage` - _Solidity coverage is triggered_

## Author

[Tunahan Dağ](https://github.com/tunahandag)
