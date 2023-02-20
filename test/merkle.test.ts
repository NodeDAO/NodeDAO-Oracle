import {describe, expect, test} from "@jest/globals";
import {MerkleTree} from "merkletreejs";
import {ethers} from "ethers";
import {logger} from "../src/lib/log/log";
import {StandardMerkleTree} from "@openzeppelin/merkle-tree";

describe("merkle tree test", () => {
    const arr = ["1", "2", "3", "4", "5"];

    let merkleTree = new MerkleTree(arr, ethers.utils.keccak256);
    const hexRoot = merkleTree.getHexRoot();

    test("merkle root", () => {
        expect(hexRoot).toBe(
            "0x3d8a22498dc1653ea6ba4aa4772538b9b683ae7357394d5b2f326e2c5b89d551"
        );
    });

    test("merkle verify", () => {
        const leaf = "1";
        const proof = merkleTree.getProof(leaf);
        const verify = merkleTree.verify(proof, leaf, hexRoot);
        expect(verify).toBe(true);
    });
});

describe("merkle tree object test", () => {
    const objectArr = [
        {age: 1, name: "Job"},
        {age: 2, name: "Zh"},
        {age: 3, name: "Ha"},
    ].map((x) => ethers.utils.keccak256(Buffer.from(JSON.stringify(x))));

    let tree = new MerkleTree(objectArr, ethers.utils.keccak256);
    const hexRoot = tree.getHexRoot();
    const root = tree.getRoot();

    test("merkle object root", () => {
        logger.info("root:%s", root);
        logger.info("hexRoot:%s", hexRoot);
        expect(hexRoot).toBe(
            "0x58d40378452cab5f3f177e4a36e706087da75f9a745e076b93959d25883efce7"
        );
    });

    test("merkle object verify", () => {
        const leaf = ethers.utils.keccak256(
            Buffer.from(JSON.stringify({age: 1, name: "Job"}))
        );
        const proof = tree.getProof(leaf);
        const verify = tree.verify(proof, leaf, hexRoot);
        expect(verify).toBe(true);
    });
});

describe("openzeppelin/merkle-tree test", () => {
    // (1)
    const values = [
        ["0x1111111111111111111111111111111111111111", "5000000000000000000"],
        ["0x2222222222222222222222222222222222222222", "2500000000000000000"],
    ];

    const tree = StandardMerkleTree.of(values, ["address", "uint256"]);

    test("merkle object root", () => {
        expect(tree.root).toBe(
            "0xd4dee0beab2d53f2cc83e567171bd2820e49898130a22622b10ead383e90bd77"
        );
    });

    test("merkle object verify", () => {
        for (const [i, v] of tree.entries()) {
            if (v[0] === "0x1111111111111111111111111111111111111111") {
                // (3)
                const proof = tree.getProof(i);
                console.log("Value:", v);
                console.log("Proof:", proof);
            }
        }

        const proof = tree.getProof(0);
        console.log("Proof[0]:", proof);
        let leafHash = tree.leafHash([
            "0x1111111111111111111111111111111111111111",
            "5000000000000000000",
        ]);
        console.log("leafHash:", leafHash);
    });
});

describe("openzeppelin/merkle-tree test object", () => {
    // (1)
    const vs = [
        [
            "0x92a14b12a4231e94507f969e367f6ee0eaf93a9ba3b82e8ab2598c8e36f3cd932d5a446a528bf3df636ed8bb3d1cfde9",
            "32000000000000000000",
            "0",
        ],
        [
            "0x83d3693fb9da8aed60a5c94c51927158d6e3a4d36fa6982ba2c87f83260329baf08f93d000f9261911420a9c0f0eb022",
            "33000000000000000000",
            "1",
        ],
    ];

    const tree = StandardMerkleTree.of(vs, ["bytes", "uint128", "uint32"]);

    test("merkle object root", () => {
        expect(tree.root).toBe(
            "0x847e7dedeae2fdb5b098c298e3aff134d9cc0a8d61126631f7bfe43b7ba1dfe4"
        );
    });

    test("merkle object verify", () => {
        for (const [i, v] of tree.entries()) {
            if (
                v[0] ===
                "0x83d3693fb9da8aed60a5c94c51927158d6e3a4d36fa6982ba2c87f83260329baf08f93d000f9261911420a9c0f0eb022"
            ) {
                // (3)
                const proof = tree.getProof(i);
                console.log("Value:", v);
                console.log("Proof:", proof);
            }
        }

        let leafHash = tree.leafHash([
            "0x92a14b12a4231e94507f969e367f6ee0eaf93a9ba3b82e8ab2598c8e36f3cd932d5a446a528bf3df636ed8bb3d1cfde9",
            "32000000000000000000",
            "0",
        ]);
        console.log("leafHash:", leafHash);
    });

    test("merkle dump", () => {
        console.log(JSON.stringify(tree.dump()));
    });

});
