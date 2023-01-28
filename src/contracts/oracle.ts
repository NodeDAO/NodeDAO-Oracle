/**
 * desc: Smart contract encapsulation that reportBeacon needs to invoke
 * @author renshiwei
 * Date: 2023/1/12 11:50
 **/
import {ethers} from "ethers";
import {config} from "../config/config";
import beaconOracleAbi from './abi/beaconOracle.json';
import vNFTAbi from './abi/vNFT.json';

const BEACON_ORACLE_CONTRACT_ADDR = "0xafCB746451ca2601cF809BA14dd6afE899dbFC17";
const VNFT_CONTRACT_ADDR = "0x7691c4051b3B7c149D938D1Bb8758eA155c0991E";

const executionLayerAddr = config.executionLayerAddr;
const provider = new ethers.providers.JsonRpcProvider(executionLayerAddr);
const privateKey = config.privateKey;
const wallet = new ethers.Wallet(privateKey, provider);

const oracleContract = new ethers.Contract(BEACON_ORACLE_CONTRACT_ADDR, beaconOracleAbi, wallet);
const vNFTContract = new ethers.Contract(VNFT_CONTRACT_ADDR, vNFTAbi, wallet);

export const oracleMemberAddress = wallet.address;

//-------------------------------- BeaconOracle --------------------------------

export function getOracleContract(): ethers.Contract {
    return oracleContract;
}

export function getExpectedEpochId(): Promise<ethers.BigNumber> {
    return oracleContract.expectedEpochId();
}

export function isCurrentFrame(): Promise<boolean> {
    return oracleContract.isCurrentFrame();
}

export function isReportBeacon(oracleMember: string): Promise<boolean> {
    return oracleContract.isReportBeacon(oracleMember);
}

export function reportBeacon(
    epochId: ethers.BigNumber,
    beaconBalance: ethers.BigNumber,
    beaconValidators: number,
    validatorRankingRoot: string
): Promise<void> {
    return oracleContract.reportBeacon(epochId, beaconBalance, beaconValidators, validatorRankingRoot);
}

//------------------------------ vNFT ----------------------------------

export function getPubkeys(): Promise<string[]> {
    return vNFTContract.activeValidators();
}

export function tokenIdOfValidator(pubkey: string): Promise<number> {
    return vNFTContract.tokenOfValidator(pubkey);
}
