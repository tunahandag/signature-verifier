require('solidity-docgen');
require('solidity-coverage');
require('@nomiclabs/hardhat-etherscan');
require('@nomicfoundation/hardhat-chai-matchers');
/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
	defaultNetwork: 'hardhat',
	networks: {
		hardhat: {
			chainId: 31377,
		},
	},
	solidity: '0.8.17',
	settings: {
		optimizer: {
			enabled: true,
			runs: 200,
		},
	},
};
