/*
 * @Description:
 * @author: renshiwei
 * @date: Do not edit
 */
/*
 * @Description:
 * @author: renshiwei
 * @date: Do not edit
 */
/**
 * desc: Test beacon interaction
 * @author renshiwei
 * Date: 2022/12/30 15:35
 **/

import {describe, jest, test} from "@jest/globals";
import {getAsyncValidatorsBySlot} from "../src/api/beacon";
import {config} from "../src/config/config";
import {ethers} from 'ethers'
import {toSlot} from '../src/lib/beacon/epoch'

describe("beacon validator info", () => {
    jest.setTimeout(30000);
    const beaconAddr = config.beaconNodeAddr;

    test("one validator", (done) => {
        getAsyncValidatorsBySlot(beaconAddr, "4793440", [
            '0x800015473bdc3a7f45ef8eb8abc598bc20021e55ad6e6ad1d745aaef9730dd2c28ec08bf42df18451de94dd4a6d24ec5',
            '0x80002a650ac64c6c6076f0186e49a8a1e3312d3c4015dcc8d1374afb6fe3df5e7e96203a193770e134b33953e9e469a1'
        ])
            .then((response) => {
                console.log(response.data.data);
                done();
            })
            .catch((error) => {
                console.log(error);
            });
    });

    test("more validator", (done) => {
        getAsyncValidatorsBySlot(beaconAddr, "finalized", [
            '0x800015473bdc3a7f45ef8eb8abc598bc20021e55ad6e6ad1d745aaef9730dd2c28ec08bf42df18451de94dd4a6d24ec5',
            '0x80002a650ac64c6c6076f0186e49a8a1e3312d3c4015dcc8d1374afb6fe3df5e7e96203a193770e134b33953e9e469a1'
        ])
            .then((response) => {
                console.log(response.data.data);
                done();
            })
            .catch((error) => {
                console.log(error);
            });
    });

    test("slot", () => {
        console.log(toSlot(ethers.BigNumber.from(153000)).toString());
    });
});
