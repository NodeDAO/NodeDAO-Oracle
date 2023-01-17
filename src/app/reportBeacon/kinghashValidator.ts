import {StandardMerkleTree} from "@openzeppelin/merkle-tree";

/**
 * Encapsulation of reportBean validator struct
 * @author renshiwei
 * Date: 2022/12/29 16:58
 **/
export class KinghashValidator {
    pubkey: string;
    validatorBalance: number;
    nftTokenId: number;

    constructor(pubkey: string, validatorBalance: number, nftTokenID: number) {
        this.pubkey = pubkey;
        this.validatorBalance = validatorBalance;
        this.nftTokenId = nftTokenID;
    }

    toStringArray(): string[] {
        return [this.pubkey, this.validatorBalance.toString(), this.nftTokenId.toString()];
    }

}

/**
 * Constructing two-dimensional array
 */
function build2DArray(kinghashValidators: KinghashValidator[]): string[][] {
    return kinghashValidators.map((val) => [val.pubkey, val.validatorBalance.toString(), val.nftTokenId.toString()]);
}

/**
 * kinghashValidators sort by mapr
 * @param {KinghashValidator[]} kinghashValidators
 * @returns {KinghashValidator[]} sorted kinghashValidators
 */
export function sortDesc(kinghashValidators: KinghashValidator[]) {
    kinghashValidators.sort((a, b) => a.nftTokenId - b.nftTokenId);
}

/**
 * KinghashValidator[] to MerkleTree
 * @param {KinghashValidator[]} sortedKinghashValidators
 * @returns StandardMerkleTree<string[]>
 */
export function toMerkleTree(sortedKinghashValidators: KinghashValidator[]): StandardMerkleTree<string[]> {
    return StandardMerkleTree.of(build2DArray(sortedKinghashValidators), ["bytes", "uint128", "uint32"]);
}

