/**
 * desc: interact with beacon
 * @author renshiwei
 * Date: 2022/12/30 14:38
 **/

// import {getValidatorsBySlot} from '../../src/api/beacon'

import {getAsyncValidatorsBySlot} from '../../api/beacon'
import {config} from '../../config/config'
import {splitIntoGroups} from '../utils/array'

/**
 * desc: eth stake principal
 * @type {number} gwei
 */
export const STAKE_ETH = 32000000000;

export const GWEI = 1e9;

/**
 * Get the validator's mpr
 * @param {number} currentBalance
 * @param {number} before30DBalance
 * @returns {number} mpr
 */
export function getValidator30Mpr(currentBalance: number, before30DBalance: number): number {
    return (currentBalance - before30DBalance) / STAKE_ETH;
}

export function getTotalBeaconBalances(pubkeys: string[], slot: string) {
    const splitPubkeys = splitIntoGroups(pubkeys, 1000);

    // 1000个为一组去信标链获取数据
    for (let partPubkeys of splitPubkeys) {
        getAsyncValidatorsBySlot(
            config.beaconNodeAddr,
            slot,
            partPubkeys
        )
            .then((response) => {
                console.log(response.data.data);
            })
            .catch((error) => {
                console.log(error);
            })
    }


}



