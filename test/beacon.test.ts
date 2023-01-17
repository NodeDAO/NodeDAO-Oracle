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

import { describe, test } from "@jest/globals";
import { getAsyncValidatorsBySlot } from "../src/api/beacon";
import { config } from "../src/config/config";

describe("beacon validator info", () => {
  const beaconAddr = config.beaconNodeAddr;

  test("one validator", (done) => {
    getAsyncValidatorsBySlot(beaconAddr, "5499327", [
      "0xae549df8106d04be04f39c29851f64f2e96f0403754b3a38428a0b0f51ddbf9e3ce95eca3bd09cf837bca458a15daeba",
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
      "0xae549df8106d04be04f39c29851f64f2e96f0403754b3a38428a0b0f51ddbf9e3ce95eca3bd09cf837bca458a15daeba",
      "0xb0be626e6ba43a20d99775e38b5a449b060a882520de3d9f40b2f223cf985088d92c0de3b19b9f87aa867c30e6d1951a",
    ])
      .then((response) => {
        console.log(response.data.data);
        done();
      })
      .catch((error) => {
        console.log(error);
      });
  });
});
