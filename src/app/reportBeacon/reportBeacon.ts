/**
 * desc: Call contract to reportBeacon
 * @author renshiwei
 * Date: 2023/1/11 19:34
 **/
import {KinghashValidator, sortDesc, toMerkleTree} from './kinghashValidator'
import {splitIntoGroups} from '../../lib/utils/array'
import {getAsyncValidatorsBySlot} from '../../api/beacon'
import * as oracleContract from '../../contracts/oracle'
import {GWEI} from '../../lib/beacon/beacon'
import {toSlot} from '../../lib/beacon/epoch'
import {config} from '../../config/config'
import {logger} from "../../lib/log/log";
import {ethers} from 'ethers'

export class ReportBeacon {
    epochId: ethers.BigNumber;
    beaconBalance: ethers.BigNumber;
    beaconValidators: number;
    validatorRankingRoot: string;

    constructor(epochId: ethers.BigNumber, beaconBalance: ethers.BigNumber, beaconValidators: number, validatorRankingRoot: string) {
        this.epochId = epochId;
        this.beaconBalance = beaconBalance;
        this.beaconValidators = beaconValidators;
        this.validatorRankingRoot = validatorRankingRoot;
    }
}

export async function reportBeacon() {
    let isQuorum;
    await oracleContract.isQuorum().then((q: boolean) => {
        isQuorum = q;
    })
    if (isQuorum) {
        return;
    }

    let isReportedBeacon;
    await oracleContract.isReportBeacon(oracleContract.getOracleContract().address).then((r: boolean) => {
        isReportedBeacon = r;
    })
    if (isReportedBeacon) {
        return;
    }

    let reportBeaconRes: ReportBeacon = new ReportBeacon(ethers.BigNumber.from(0), ethers.BigNumber.from(0), 0, "");

    await buildReportBeacon().then(r => {
        reportBeaconRes = r;
    })
    // oracle reportBeacon
    await oracleContract.reportBeacon(reportBeaconRes.epochId, reportBeaconRes.beaconBalance, reportBeaconRes.beaconValidators, reportBeaconRes.validatorRankingRoot).then(() => {

    })

}

async function buildReportBeacon(): Promise<ReportBeacon> {
    // Obtain the expectEpochId of the contract
    let expectEpochId: ethers.BigNumber = ethers.BigNumber.from(0);
    await oracleContract.getExpectedEpochId().then((epoch: ethers.BigNumber) => {
        expectEpochId = epoch;
    });
    let slot = toSlot(expectEpochId);

    // Request the Smart contract to get all the pubkeys
    let pubkeys: string[] = [];
    await oracleContract.getPubkeys().then((p: string[]) => {
        pubkeys = p;
    })

    let pubkeyOriginLen = pubkeys.length;
    // Filter invalid Pubkeys
    pubkeys = pubkeys.filter(pubkey => pubkey !== "0x");

    logger.info("[buildReportBeacon] expectEpochId:%i contract pubkey count:%i. invalid pubkeys('0x') count:%i. effective pubkey count:%i", expectEpochId, pubkeyOriginLen, pubkeyOriginLen - pubkeys.length, pubkeys.length);

    let kinghashValidators: KinghashValidator[] = [];
    let reportBeaconRes = new ReportBeacon(ethers.BigNumber.from(0), ethers.BigNumber.from(0), 0, "");

    // Construct map data to facilitate subsequent calculation
    let validatorMap = new Map<string, KinghashValidator>();
    for (let pubkey of pubkeys) {
        // Get the nftTokenId from the contract
        let tokenId = 0;
        await oracleContract.tokenIdOfValidator(pubkey).then((token: number) => {
            tokenId = token;
        })
        validatorMap.set(pubkey, new KinghashValidator(pubkey, 0, tokenId));
    }

    let beaconBalance = ethers.BigNumber.from(0);
    let validators = 0;
    // Split the array,1000 of them into a set of beacon chains to get data
    let splitPubkeys = splitIntoGroups(pubkeys, 1000);
    for (let partPubkeys of splitPubkeys) {
        try {
            let partRes = getBalanceRetry(partPubkeys, slot, validatorMap);
            beaconBalance.add(partRes.beaconBalance);
            validators += partRes.beaconValidators;
        } catch (error) {
            logger.error("Error: ", error);
            return reportBeaconRes;
        }
    }

    kinghashValidators = Array.from(validatorMap.values());

    for (let kinghashValidator of kinghashValidators) {
        if (kinghashValidator.validatorBalance === 0) {
            // Process data that is not in the beacon chain
            kinghashValidator.validatorBalance = 32 * 1e18;
            beaconBalance.add(32 * 1e18);
            validators++;
        }
    }

    sortDesc(kinghashValidators);
    const tree = toMerkleTree(kinghashValidators);

    reportBeaconRes.epochId = expectEpochId;
    reportBeaconRes.validatorRankingRoot = tree.root;
    reportBeaconRes.beaconBalance = beaconBalance;
    reportBeaconRes.beaconValidators = validators;

    return reportBeaconRes;
}


function getBalanceRetry(partPubkeys: string[], slot: ethers.BigNumber | string, validatorMap: Map<string, KinghashValidator>): { beaconBalance: number; beaconValidators: number } {
    let isFinsh = false;
    let balance = 0;
    let validators = 0;

    // Handle the failure three times
    for (let i = 0; i < 3; i++) {
        if (isFinsh) {
            break;
        }
        getAsyncValidatorsBySlot(
            config.beaconAddr,
            slot,
            partPubkeys
        )
            .then((response) => {
                let balanceArray = response.data.data as any[];
                for (let balanceInfo of balanceArray) {
                    if (validatorMap.has(balanceInfo.validator.pubkey)) {
                        let kinghashValidator = validatorMap.get(balanceInfo.validator.pubkey) as KinghashValidator;
                        // gwei conversion to wei
                        kinghashValidator.validatorBalance = balanceInfo.balance * GWEI;
                        balance += kinghashValidator.validatorBalance;
                        validators++;
                        validatorMap.set(balanceInfo.validator.pubkey, kinghashValidator);
                    }
                }

                isFinsh = true;
            })
            .catch(() => {
                logger.warn("Failed to access the beacon chain. retry Count:%i", i);
                if (i === 2) {
                    throw new Error("Failed to retry the beacon chain request 3 times")
                }
            })
    }

    return {beaconBalance: balance, beaconValidators: validators};
}
