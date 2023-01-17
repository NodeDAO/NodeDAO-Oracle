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

    console.log("Merkle Root:", tree.root);

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
            "0x80000001677f23a227dfed6f61b132d114be83b8ad0aa5f3c5d1d77e6ee0bf5f73b0af750cc34e8f2dae73c21dc36f4a",
            "32000000000000000000",
            "1",
        ],
        [
            "0x800003d8af8aa481646da46d0d00ed2659a5bb303e0d88edf468abc1259a1f23ccf12eaeaa3f80511cfeaf256904a72a",
            "33000000000000000000",
            "2",
        ],
        [
            "0x800006d4b1026b6149168b342e6883d48ede9539202cc414448b1b796394440a5401e8d6620e65d7c77654bf1db199b1",
            "34000000000000000000",
            "3",
        ],
    ];

    const tree = StandardMerkleTree.of(vs, ["bytes", "uint128", "uint32"]);
    // const tree = StandardMerkleTree.of(vs, ["bytes", "uint256", "uint256"]);

    console.log("Merkle Root:", tree.root);

    test("merkle object root", () => {
        expect(tree.root).toBe(
            "0xa934c462ec150e180a501144c494ec0d63878c1a9caca5b3d409787177c99798"
        );
    });

    test("merkle object verify", () => {
        for (const [i, v] of tree.entries()) {
            if (
                v[0] ===
                "0x80000001677f23a227dfed6f61b132d114be83b8ad0aa5f3c5d1d77e6ee0bf5f73b0af750cc34e8f2dae73c21dc36f4a"
            ) {
                // (3)
                const proof = tree.getProof(i);
                console.log("Value:", v);
                console.log("Proof:", proof);
            }
        }

        let leafHash = tree.leafHash([
            "0x80000001677f23a227dfed6f61b132d114be83b8ad0aa5f3c5d1d77e6ee0bf5f73b0af750cc34e8f2dae73c21dc36f4a",
            "32000000000000000000",
            "1",
        ]);
        console.log("leafHash:", leafHash);
    });
});
