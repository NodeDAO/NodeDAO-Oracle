/**
 * desc:
 * @author renshiwei
 * Date: 2023/1/14 15:32
 **/
import {ethers} from 'ethers'
import {describe, expect, jest, test} from '@jest/globals'
import * as oracleContract from '../src/contracts/oracle'
import {sleep} from '../src/lib/utils/sleep'

describe("oracleBeaconContract test", () => {
    jest.setTimeout(30000);

    let oracleMemberAddress = oracleContract.oracleMemberAddress;

    test("expectedEpochId", async () => {
        await oracleContract.getExpectedEpochId().then((epoch: ethers.BigNumber) => {
            console.log("epoch:%i", epoch);
        })
    });

    test("getFirstOfFrameEpochId", async () => {
        await oracleContract.getFirstOfFrameEpochId(ethers.BigNumber.from("156052")).then((epoch: ethers.BigNumber) => {
            console.log("epoch:%i", epoch);
        })
    });

    test("isCurrentFrame", async () => {
        await oracleContract.isCurrentFrame().then((isCurrentFrame: boolean) => {
            console.log(isCurrentFrame);
        })
    });

    test("isReportBeacon", async () => {
        // const oracleMemberAddress = "0xe583DC38863aB4b5A94da77A6628e2119eaD4B18";
        await oracleContract.isReportBeacon(oracleMemberAddress).then((isReportBeacon: boolean) => {
            console.log(isReportBeacon);
        })
    });

    test("getMerkleRoot", async () => {
        // const oracleMemberAddress = "0xe583DC38863aB4b5A94da77A6628e2119eaD4B18";
        await oracleContract.getMerkleRoot().then((root) => {
            console.log(root);
        })
    });

});


describe("vNFTContract test", () => {

    test("get all pubkeys", async () => {
        await oracleContract.getPubkeys().then((pubkeys: string[]) => {
            console.log("pubkeys:", pubkeys);
        })
    });

    test("tokenIdOfValidator", async () => {
        const pubkey = "0x";
        await oracleContract.tokenIdOfValidator(pubkey).then((tokenId: number) => {
            console.log("tokenId:%i", tokenId);
        })
    });

});

describe("ethers.js", () => {

    test("BigNumber", async () => {
        let a = 32 * 1e18;
        let b = ethers.BigNumber.from(a.toString());
        console.log(b.toString());

        let c = b.add(ethers.BigNumber.from("1000"));
        console.log(c.toString());

        let d = b.add(b);
        console.log(d.toString());
    });

    test("BigNumber add", async () => {
        let beaconBalance = ethers.BigNumber.from("0");
        const n = 32 * 1e18;
        beaconBalance = beaconBalance.add(ethers.BigNumber.from(n.toString()));
        expect(beaconBalance).toStrictEqual(ethers.BigNumber.from(n.toString()));
    });


});


describe("beacon event", () => {
    jest.setTimeout(500000);

    test("ReportBeacon", async () => {
        oracleContract.getOracleContract().on("ReportBeacon", (epochId, sameReportCount, quorum) => {
            console.log("ReportBeacon Event:", epochId, sameReportCount, quorum);
        });
    });

    test("AddOracleMember", async () => {
        oracleContract.getOracleContract().on("AddOracleMember", (oracleMember) => {
            console.log("AddOracleMember Event:", oracleMember);
        });
        await sleep(1000 * 60 * 10);
    });

});
