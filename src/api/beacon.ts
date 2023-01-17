/**
 * desc: beacon http api packaging
 * @author renshiwei
 * Date: 2023/1/3 19:31
 **/

import axios from 'axios'
import {ethers} from 'ethers'

/**
 * Obtain information about the validator
 * @param {string} beaconAddr
 * @param {number | string} slot
 * @param {string[]} pubkeys
 */
export async function getAsyncValidatorsBySlot(beaconAddr: string, slot: ethers.BigNumber | string, pubkeys: string[]) {
    return axios.get(beaconAddr + '/eth/v1/beacon/states/' + slot + '/validators', {
        params: {
            "id": pubkeys.join(','),
        }
    });
}
