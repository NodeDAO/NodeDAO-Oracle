/**
 * desc: kinghashValidator test
 * @author renshiwei
 * Date: 2023/1/4 12:06
 **/
import { describe, expect, test } from "@jest/globals";
import {
  KinghashValidator,
  sortDesc,
  toMerkleTree,
} from "../src/app/reportBeacon/kinghashValidator";

describe("KinghashValidator mock test", () => {
  const validators: KinghashValidator[] = [
    new KinghashValidator(
      "0x80000001677f23a227dfed6f61b132d114be83b8ad0aa5f3c5d1d77e6ee0bf5f73b0af750cc34e8f2dae73c21dc36f4a",
      334,
      3
    ),
    new KinghashValidator(
      "0x800003d8af8aa481646da46d0d00ed2659a5bb303e0d88edf468abc1259a1f23ccf12eaeaa3f80511cfeaf256904a72a",
      350,
      2
    ),
    new KinghashValidator(
      "0x80000001677f23a227dfed6f61b132d114be83b8ad0aa5f3c5d1d77e6ee0bf5f73b0af750cc34e8f2dae73c21dc36f4a",
      32000000000000000000,
      1
    ),
  ];

  sortDesc(validators);

  test("sort", () => {
    console.log(validators[0]);
  });

  const validatorsMerkleTree = toMerkleTree(validators);
  const hexRoot = validatorsMerkleTree.root;

  test("merkleTree root", () => {
    expect(hexRoot).toBe(
      "0x2a123696fd93a7661387b66dfae6496e2235a26d3e79b797b5ef37a6691a87a4"
    );
  });

  test("merkle verify", () => {
    for (const [i, v] of validatorsMerkleTree.entries()) {
      if (
        v[0] ===
        "0x80000001677f23a227dfed6f61b132d114be83b8ad0aa5f3c5d1d77e6ee0bf5f73b0af750cc34e8f2dae73c21dc36f4a"
      ) {
        // (3)
        const proof = validatorsMerkleTree.getProof(i);
        console.log("Value:", v);
        console.log("Proof:", proof);
      }
    }

    let validator = new KinghashValidator(
      "0x80000001677f23a227dfed6f61b132d114be83b8ad0aa5f3c5d1d77e6ee0bf5f73b0af750cc34e8f2dae73c21dc36f4a",
      32000000000000000000,
      1
    );
    let leaf = validator.toStringArray();
    let leafHash = validatorsMerkleTree.leafHash(leaf);
    console.log("leafHash:", leafHash);
    expect(leafHash).toBe(
      "0x10e799df87265a6e1c8b5d60ce37fbca4a02c93b5a6a9f5895eeb41a209620f6"
    );
  });
});
