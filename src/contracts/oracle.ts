/**
 * desc: Smart contract encapsulation that reportBeacon needs to invoke
 * @author renshiwei
 * Date: 2023/1/12 11:50
 **/
import {ethers} from "ethers";
import {config} from "../config/config";
import beaconOracleAbi from './abi/beaconOracle.json';
import vNFTAbi from './abi/vNFT.json';

const BEACON_ORACLE_CONTRACT_ADDR = "0xa5c6C39244875Ef0ad0a06B768Cf8144F640D9BA";
const VNFT_CONTRACT_ADDR = "0x4f7D3fb0ff08fcC38fcdbADd73bAc8F43e45582B";

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

export function getEpochsPerFrame(): Promise<ethers.BigNumber> {
    return oracleContract.epochsPerFrame();
}

export function getCurrentEpochId(): Promise<ethers.BigNumber> {
    return oracleContract.getCurrentEpochId();
}

export function getFirstOfFrameEpochId(epoch: ethers.BigNumber): Promise<ethers.BigNumber> {
    return oracleContract.getFrameFirstEpochOfDay(epoch);
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

export function verifyNftValue(proof: string[], pubkey: string, balance: ethers.BigNumber, tokenId: ethers.BigNumber): Promise<boolean> {
    return oracleContract.verifyNftValue(proof, pubkey, balance, tokenId);
}

//------------------------------ vNFT ----------------------------------

export function getPubkeys(): Promise<string[]> {
    return vNFTContract.activeValidators();
}

export function tokenIdOfValidator(pubkey: string): Promise<number> {
    return vNFTContract.tokenOfValidator(pubkey);
}
