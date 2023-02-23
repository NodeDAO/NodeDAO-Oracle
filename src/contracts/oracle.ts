/**
 * desc: Smart contract encapsulation that reportBeacon needs to invoke
 * @author renshiwei
 * Date: 2023/1/12 11:50
 **/
import {ethers} from "ethers";
import {config} from "../config/config";
import beaconOracleAbi from './abi/beaconOracle.json';
import vNFTAbi from './abi/vNFT.json';
import {ETH_GOERLI, ETH_MAINNET} from '../lib/constants/eth'

const executionLayerAddr = config.executionLayerAddr;
const provider = new ethers.providers.JsonRpcProvider(executionLayerAddr);
const privateKey = config.privateKey;
const wallet = new ethers.Wallet(privateKey, provider);

const oracleContract = new ethers.Contract(getOracleContractAddr(), beaconOracleAbi, wallet);
const vNFTContract = new ethers.Contract(getNftContractAddr(), vNFTAbi, wallet);

export const oracleMemberAddress = wallet.address;

// -------------------------- contracts address --------------------------------------
export function getOracleContractAddr(): string {
    let addr = "";
    switch (config.network) {
        case ETH_MAINNET:
            addr = "0x503525159C0174C7758fe3D6C8eeCC595768a7A1";
            break;
        case ETH_GOERLI:
            addr = "0x13766719dacc651065D5FF2a94831B46f84481b7";
            break;
    }
    return addr;
}

export function getNftContractAddr(): string {
    let addr = "";
    switch (config.network) {
        case ETH_MAINNET:
            addr = "0x58553F5c5a6AEE89EaBFd42c231A18aB0872700d";
            break;
        case ETH_GOERLI:
            addr = "0xe3CE494D51Cb9806187b5Deca1B4B06c97e52EFc";
            break;
    }
    return addr;
}

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
