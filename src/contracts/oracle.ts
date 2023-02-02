/**
 * desc: Smart contract encapsulation that reportBeacon needs to invoke
 * @author renshiwei
 * Date: 2023/1/12 11:50
 **/
import {ethers} from "ethers";
import {config} from "../config/config";
import beaconOracleAbi from './abi/beaconOracle.json';
import vNFTAbi from './abi/vNFT.json';

const BEACON_ORACLE_CONTRACT_ADDR = "0x7dC41e563766Bbb062A0b14Aece4d137d8F3F4fc";
const VNFT_CONTRACT_ADDR = "0xA55506acca8f2A655436CB140962269AB87d3370";

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
    beaconValidators: ethers.BigNumber,
    validatorRankingRoot: string
): Promise<void> {
    return oracleContract.reportBeacon(epochId, beaconBalance, beaconValidators, validatorRankingRoot);
}

export function getMerkleRoot(): Promise<string> {
    return oracleContract.merkleTreeRoot();
}

//------------------------------ vNFT ----------------------------------

export function getPubkeys(): Promise<string[]> {
    return vNFTContract.activeValidators();
}

export function tokenIdOfValidator(pubkey: string): Promise<number> {
    return vNFTContract.tokenOfValidator(pubkey);
}
