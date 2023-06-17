const { ethers } = require('hardhat');
const { expect } = require('chai');
const { time } = require('@nomicfoundation/hardhat-network-helpers');

const { getEIP712Signature } = require('./common/utilities');

const { SIGNING_DOMAIN_NAME, SIGNATURE_VERSION, CHAIN_ID } = require('./common/constants');

describe('VerifySignature', function () {
	const setupSignature = async (contractAddress, signer, buyerAddress, timestamp, id, nonce) => {
		const domain = {
			name: SIGNING_DOMAIN_NAME,
			version: SIGNATURE_VERSION,
			verifyingContract: contractAddress,
			chainId: CHAIN_ID,
		};

		const buy = {
			id: id,
			timestamp: timestamp,
			buyer: buyerAddress,
			nonce: nonce,
		};

		const types = {
			Buy: [
				{ name: 'id', type: 'uint256' },
				{ name: 'timestamp', type: 'uint256' },
				{ name: 'buyer', type: 'address' },
				{ name: 'nonce', type: 'uint256' },
			],
		};

		const signature = await getEIP712Signature(domain, types, buy, signer);

		return { ...buy, signature };
	};

	let deployer, signer1, signer2;
	let signatureVerifier;
	let web3;
	let sameDate, sameNonce;
	before(async function () {
		[deployer, signer1, signer2] = await ethers.getSigners();
		const signatureVerifierContract = await ethers.getContractFactory('SignatureVerifier');
		signatureVerifier = await signatureVerifierContract.connect(deployer).deploy();
		await signatureVerifier.deployed();
	});
	it('A valid signature from signer1 can go through the verification.', async function () {
		sameDate = Date.now();
		sameNonce = await signatureVerifier.getNonce(signer1.address);

		const result = await setupSignature(
			signatureVerifier.address,
			signer1,
			signer1.address,
			sameDate,
			1,
			0,
		);
		const { id, timestamp, buyer, nonce, signature } = result;

		await expect(
			signatureVerifier
				.connect(signer2)
				.verifySignature([id, timestamp, buyer, nonce], signature),
		)
			.to.emit(signatureVerifier, 'SignatureVerified')
			.withArgs(id, timestamp, buyer);
		const newNonce = await signatureVerifier.getNonce(signer1.address);

		await expect(newNonce).to.equal(sameNonce + 1);
	});
	it('The same signature from signer1 cannot be used more than once.', async function () {
		const result = await setupSignature(
			signatureVerifier.address,
			signer1,
			signer1.address,
			sameDate,
			1,
			sameNonce,
		);
		const { id, timestamp, buyer, nonce, signature } = result;

		await expect(
			signatureVerifier
				.connect(signer2)
				.verifySignature([id, timestamp, buyer, nonce], signature),
		).to.revertedWithCustomError(signatureVerifier, 'SignatureAlreadyUsed');
	});
	it('Signer1 signs the buy object of signer2 which must revert.', async function () {
		const buyerNonce = await signatureVerifier.getNonce(signer2.address);
		const result = await setupSignature(
			signatureVerifier.address,
			signer1,
			signer2.address,
			Date.now(),
			3,
			buyerNonce,
		);
		const { id, timestamp, buyer, nonce, signature } = result;

		await expect(
			signatureVerifier
				.connect(signer2)
				.verifySignature([id, timestamp, buyer, nonce], signature),
		).to.revertedWithCustomError(signatureVerifier, 'InvalidSigner');
	});
	it('A valid signature from signer1 can go through the verification.', async function () {
		const buyerNonce = await signatureVerifier.getNonce(signer2.address);
		const result = await setupSignature(
			signatureVerifier.address,
			signer2,
			signer2.address,
			Date.now(),
			7,
			buyerNonce,
		);
		const { id, timestamp, buyer, nonce, signature } = result;

		await expect(
			signatureVerifier
				.connect(signer1)
				.verifySignature([id, timestamp, buyer, nonce], signature),
		)
			.to.emit(signatureVerifier, 'SignatureVerified')
			.withArgs(id, timestamp, buyer);
		const newNonce = await signatureVerifier.getNonce(signer1.address);

		await expect(newNonce).to.equal(buyerNonce + 1);
	});
	it('A valid signature must revert if timestamp in buy object is expired.', async function () {
		const buyerNonce = await signatureVerifier.getNonce(signer2.address);
		const expiredTimestamp = Date.now() - 100000;
		// mine a new block with timestamp `newTimestamp`
		await time.increaseTo(Date.now() + 100000);
		const result = await setupSignature(
			signatureVerifier.address,
			signer2,
			signer2.address,
			expiredTimestamp,
			15,
			buyerNonce,
		);
		const { id, timestamp, buyer, nonce, signature } = result;

		await expect(
			signatureVerifier
				.connect(signer2)
				.verifySignature([id, timestamp, buyer, nonce], signature),
		).to.revertedWithCustomError(signatureVerifier, 'SignatureExpired');

		const newNonce = await signatureVerifier.getNonce(signer1.address);

		await expect(newNonce).to.equal(buyerNonce);
	});
});
