/**
 * desc: epoch util
 * @author renshiwei
 * Date: 2022/12/30 11:54
 **/

import {ethers} from 'ethers'

/**
 * beacon Specifies the number of slots corresponding to an epoch
 * @type {number}
 */
const ETH2_SLOTS_PER_EPOCH = 32;

/**
 * how long is an epoch
 * @type {number}
 */
const ETH2_PER_EPOCH_MIN = 6.4;

/**
 * Number of epochs in 30 days:
 * 30d = 30*24*60 = 43200min
 * 43200 / 6.4 = 6750
 * @type {number}
 */
const ETH2_30D_EPOCH_COUNT = 6750;

/**
 * desc: epoch to slot
 * @param {number} epoch
 * @returns {number}
 */
function toSlot(epoch: ethers.BigNumber): ethers.BigNumber {
    return epoch.mul(ETH2_SLOTS_PER_EPOCH);
}

/**
 * desc: Obtain the epoch 30 days ago
 * @param {number} epoch
 * @returns {number}
 */
function get30dBeforeEpoch(epoch: ethers.BigNumber): ethers.BigNumber {
    return epoch.sub(ETH2_30D_EPOCH_COUNT);
}

/**
 * desc: Obtain the slot 30 days ago
 * @param {number} epoch
 * @returns {number}
 */
function get30dBeforeSlot(epoch: ethers.BigNumber): ethers.BigNumber {
    return get30dBeforeEpoch(toSlot(epoch));
}

export {
    ETH2_SLOTS_PER_EPOCH,
    ETH2_PER_EPOCH_MIN,
    ETH2_30D_EPOCH_COUNT,
    toSlot,
    get30dBeforeEpoch,
    get30dBeforeSlot,
}

