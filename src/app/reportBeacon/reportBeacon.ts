/**
 * desc: Call contract to reportBeacon
 * @author renshiwei
 * Date: 2023/1/11 19:34
 **/
import {ethers} from 'ethers'
import {KinghashValidator, sortDesc, toMerkleTree} from './kinghashValidator'
import {splitIntoGroups} from '../../lib/utils/array'
import {getAsyncValidatorsBySlot} from '../../api/beacon'
import * as oracleContract from '../../contracts/oracle'
import {GWEI} from '../../lib/beacon/beacon'
import {toSlot} from '../../lib/beacon/epoch'
import {config} from '../../config/config'
import {logger} from "../../lib/log/log";
import {sleep} from '../../lib/utils/sleep'
import {ServiceException} from '../../lib/error/serviceException';
import {ContractException} from '../../lib/error/contractException';
import {StandardMerkleTree} from '@openzeppelin/merkle-tree'

export class ReportBeacon {
    epochId: ethers.BigNumber;
    beaconBalance: ethers.BigNumber;
    beaconValidators: ethers.BigNumber;
    validatorRankingRoot: string;

    constructor(epochId: ethers.BigNumber, beaconBalance: ethers.BigNumber, beaconValidators: ethers.BigNumber, validatorRankingRoot: string) {
        this.epochId = epochId;
        this.beaconBalance = beaconBalance;
        this.beaconValidators = beaconValidators;
        this.validatorRankingRoot = validatorRankingRoot;
    }

    toString(): string {
        return `ReportBeacon { epochId: ${this.epochId.toString()}, beaconBalance: ${this.beaconBalance.toString()}, beaconValidators: ${this.beaconValidators.toString()}, validatorRankingRoot: ${this.validatorRankingRoot} }`;
    }
}

// The report sleep frequency was 10 minutes
export const REPORT_SLEEP_FREQUENCY = 1000 * 60 * 10;
// export const REPORT_SLEEP_FREQUENCY = 1000;
const currentOracleMember = oracleContract.oracleMemberAddress;

export async function runReportBeacon() {
    logger.debug("report beacon server start...");
    reportSuccessEvent();

    while (true) {
        try {

            let needReport;
            await isReport().then((r: boolean) => {
                needReport = r;
            })
            if (!needReport) {
                await sleep(REPORT_SLEEP_FREQUENCY);
                continue;
            }
            await reportBeacon().then().catch((e => {
                logger.error("[reportBeacon error] OracleMember address:%s", currentOracleMember, e);
            }));
            await sleep(REPORT_SLEEP_FREQUENCY);
        } catch (err) {
            switch (true) {
                case err instanceof ServiceException:

                    break;
                case err instanceof ContractException:

                    break;
                default:
                    break;
            }
        }
    }
}

async function isReport(): Promise<boolean> {
    // Whether the current frame should be reported
    let isCurrentFrame;
    await oracleContract.isCurrentFrame().then((q: boolean) => {
        isCurrentFrame = q;
    }).catch((e => {
        logger.error("[reportBeacon error for isCurrentFrame] err:%s", e);
    }));
    if (!isCurrentFrame) {
        logger.debug("isCurrentFrame:%s", isCurrentFrame);
        return false;
    }

    // Whether the current oracleMember is reporting Beacon
    let isReportedBeacon;
    await oracleContract.isReportBeacon(currentOracleMember).then((r: boolean) => {
        isReportedBeacon = r;
    }).catch((e => {
        logger.error("[reportBeacon error for isReportBeacon] err:%s", e);
    }));
    if (isReportedBeacon) {
        logger.debug("OracleMember address:%s  isReportedBeacon:%s", currentOracleMember, isReportedBeacon);
        return false;
    }

    return true;
}

async function reportBeacon() {
    let reportBeaconRes: ReportBeacon = new ReportBeacon(ethers.BigNumber.from("0"), ethers.BigNumber.from("0"), ethers.BigNumber.from("0"), "");

    await buildReportBeacon().then(r => {
        reportBeaconRes = r;
    }).catch(e => {
        if (e instanceof ServiceException) {
            if (e.code === "VALIDATOR_NOT_FOUND") {
                logger.info("buildReportBeacon pubkey is zero. Don't need to report.");
            } else {
                logger.error("buildReportBeacon error. reportBeaconRes:", reportBeaconRes, e);
            }
        }
    })

    // oracle reportBeacon
    await oracleContract.reportBeacon(reportBeaconRes.epochId, reportBeaconRes.beaconBalance, reportBeaconRes.beaconValidators, reportBeaconRes.validatorRankingRoot).then(() => {
        logger.info("[reportBeacon success] OracleMember address:%s  ReportedBeacon res:%s", currentOracleMember, reportBeaconRes.toString());
    }).catch((e => {
        logger.error("[reportBeacon error] OracleMember address:%s  ReportedBeacon res:%s error:", currentOracleMember, reportBeaconRes.toString(), e);
    }));
}

export async function buildReportBeacon(): Promise<ReportBeacon> {
    let expectEpochId: ethers.BigNumber = ethers.BigNumber.from("0");
    await dealExpectedEpochId().then((epoch: ethers.BigNumber) => {
        expectEpochId = epoch;
        logger.debug("report expectEpochId:%i", expectEpochId);
    }).catch((e => {
        logger.error("[reportBeacon error for getExpectedEpochId] err:%s", e);
    }));

    let reportBeaconRes = new ReportBeacon(ethers.BigNumber.from("0"), ethers.BigNumber.from("0"), ethers.BigNumber.from("0"), "");

    await buildReportBeaconAndMerkleTree(expectEpochId).then((r) => {
        reportBeaconRes = r.reportBeaconRes;
    }).catch((e => {
        logger.error("[reportBeacon error] err:%s", e);
    }));

    logger.debug("reportBeaconRes:", reportBeaconRes);

    return reportBeaconRes;
}

export async function buildReportBeaconAndMerkleTree(expectEpochId: ethers.BigNumber): Promise<{ reportBeaconRes: ReportBeacon; tree: StandardMerkleTree<string[]> }> {
    let kinghashValidators: KinghashValidator[] = [];
    let reportBeaconRes = new ReportBeacon(ethers.BigNumber.from("0"), ethers.BigNumber.from("0"), ethers.BigNumber.from("0"), "");

    let slot = toSlot(expectEpochId).toString();

    // Request the Smart contract to get all the pubkeys
    let pubkeys: string[] = [];
    await oracleContract.getPubkeys().then((p: string[]) => {
        pubkeys = p;
    }).catch((e => {
        logger.error("[reportBeacon error for nft getPubkeys] err:%s", e);
    }));

    let pubkeyOriginLen = pubkeys.length;
    // Filter invalid Pubkeys
    pubkeys = pubkeys.filter(pubkey => pubkey !== "0x");

    logger.debug("[buildReportBeacon] expectEpochId:%i contract pubkey count:%i. pubkeys('0x') count:%i. effective pubkey count:%i", expectEpochId, pubkeyOriginLen, pubkeyOriginLen - pubkeys.length, pubkeys.length);

    // Construct map data to facilitate subsequent calculation
    let validatorMap = new Map<string, KinghashValidator>();
    for (let pubkey of pubkeys) {
        // Get the nftTokenId from the contract
        let tokenId = 0;
        await oracleContract.tokenIdOfValidator(pubkey).then((token: number) => {
            tokenId = token;
        }).catch((e => {
            logger.error("[reportBeacon error for tokenIds] OracleMember address:%s", currentOracleMember, e);
        }));
        validatorMap.set(pubkey, new KinghashValidator(pubkey, 0, tokenId));
    }
    let beaconBalance = ethers.BigNumber.from("0");
    let validators = ethers.BigNumber.from("0");
    // Split the array,1000 of them into a set of beacon chains to get data
    let splitPubkeys = splitIntoGroups(pubkeys, 1000);
    for (let partPubkeys of splitPubkeys) {
        let partRes = {beaconBalance: ethers.BigNumber.from("0"), beaconValidators: ethers.BigNumber.from("0")};
        try {
            await getBalanceRetry(partPubkeys, slot, validatorMap).then(r => {
                partRes = r;
            }).catch((e => {
                logger.error("[reportBeacon error for beacon info] OracleMember address:%s", currentOracleMember, e);
            }));
        } catch (error) {
            if (!(error instanceof ServiceException)) {
                throw new ServiceException("BEACON_REQUEST_ERROR", "Request beacon chain exception");
            }
        }
        beaconBalance = beaconBalance.add(partRes.beaconBalance);
        validators = validators.add(partRes.beaconValidators);
    }
    kinghashValidators = Array.from(validatorMap.values());

    for (let kinghashValidator of kinghashValidators) {
        if (kinghashValidator.validatorBalance === 0) {
            // Process data that is not in the beacon chain
            kinghashValidator.validatorBalance = 32 * 1e18;
            beaconBalance = beaconBalance.add(ethers.BigNumber.from(kinghashValidator.validatorBalance.toString()));
            validators = validators.add(1);
        }
    }
    if (kinghashValidators.length == 0) {
        throw new ServiceException("VALIDATOR_NOT_FOUND", "validator count is zero.")
    }

    sortDesc(kinghashValidators);

    const tree = toMerkleTree(kinghashValidators);

    reportBeaconRes.epochId = expectEpochId;
    reportBeaconRes.validatorRankingRoot = tree.root;
    reportBeaconRes.beaconBalance = beaconBalance;
    reportBeaconRes.beaconValidators = validators;

    return {reportBeaconRes: reportBeaconRes, tree: tree}
}


export async function dealExpectedEpochId(): Promise<ethers.BigNumber> {
    // Obtain the expectEpochId of the contract
    let expectEpochId: ethers.BigNumber = ethers.BigNumber.from("0");

    let curEpoch: ethers.BigNumber = ethers.BigNumber.from("0");
    await oracleContract.getCurrentEpochId().then((epoch: ethers.BigNumber) => {
        curEpoch = epoch;
        logger.debug("contracts curEpoch:%i", curEpoch);
    }).catch((e => {
        logger.error("[reportBeacon error for get contracts curEpoch] err:%s", e);
    }));

    let firstOfFrameEpochId: ethers.BigNumber = ethers.BigNumber.from("0");
    await oracleContract.getFirstOfFrameEpochId(curEpoch).then((epoch: ethers.BigNumber) => {
        firstOfFrameEpochId = epoch;
        logger.debug("contracts expectEpochId:%i", firstOfFrameEpochId);
    }).catch((e => {
        logger.error("[reportBeacon error for get contracts firstOfFrameEpochId] err:%s", e);
    }));

    let frame: ethers.BigNumber = ethers.BigNumber.from("0");
    await oracleContract.getEpochsPerFrame().then((f: ethers.BigNumber) => {
        frame = f;
        logger.debug("contracts frame:%i", frame);
    }).catch((e => {
        logger.error("[reportBeacon error for get contracts frame] err:%s", e);
    }));

    let calculateFirstFrameEpochId = curEpoch.div(frame).mul(frame);

    if (calculateFirstFrameEpochId.gt(firstOfFrameEpochId)) {
        expectEpochId = firstOfFrameEpochId;
    } else {
        expectEpochId = calculateFirstFrameEpochId;
    }

    return expectEpochId;
}

async function getBalanceRetry(partPubkeys: string[], slot: ethers.BigNumber | string, validatorMap: Map<string, KinghashValidator>): Promise<{ beaconBalance: ethers.BigNumber; beaconValidators: ethers.BigNumber }> {
    let isFinsh = false;
    let balance = ethers.BigNumber.from("0");
    let validators = ethers.BigNumber.from("0");

    // Handle the failure three times
    for (let i = 0; i < 3; i++) {
        if (isFinsh) {
            break;
        }
        await getAsyncValidatorsBySlot(
            config.beaconNodeAddr,
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
                        balance = balance.add(kinghashValidator.validatorBalance.toString());
                        validators = validators.add(1);
                        validatorMap.set(balanceInfo.validator.pubkey, kinghashValidator);
                    }
                }

                isFinsh = true;
            })
            .catch((err) => {
                logger.warn("Failed to access the beacon chain. retry Count:%i err:%s", i, err.message);
                if (i === 2) {
                    throw new ServiceException("BEACON_REQUEST_RETRY_ERROR", "Failed to retry the beacon chain request 3 times")
                }
            })
    }

    return {beaconBalance: balance, beaconValidators: validators};
}

export function reportSuccessEvent() {
    oracleContract.getOracleContract().on("ReportSuccess", (epochId, sameReportCount, quorum, beaconBalance, beaconValidators, validatorRankingRoot) => {
        logger.info("ReportSuccess Event epochId:%i sameReportCount:%i quorum:%i beaconBalance:%i beaconValidators:%i validatorRankingRoot:%s", epochId, sameReportCount, quorum, beaconBalance, beaconValidators, validatorRankingRoot);
    });
}
