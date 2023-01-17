import {MerkleTree} from 'merkletreejs';
// import {SHA256} from 'crypto-js';
import {ethers} from 'ethers'

/**
 * Create a merkle tree using the data and the SHA-256 hash function
 * @param data Turn to merkle's array
 * @returns {MerkleTree} merkle tree
 */
export function toMerkleTreeByKeccak256<T>(data: T[]): MerkleTree {
    return new MerkleTree(data, ethers.utils.keccak256);
}
