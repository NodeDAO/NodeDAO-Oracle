/**
 * desc:
 * @author renshiwei
 * Date: 2023/1/13 20:07
 **/
import {describe, test} from "@jest/globals";
import {config} from "../src/config/config"
import {ethers} from 'ethers'
import Web3 from 'web3'
import liqAbi from "./contracts/liqABI.json"

// declare const liqAbi: any;
const GOERLI = config.executionLayerAddr;
const PRIVATE = config.privateKey;
const liqContractAddr = "0xe04eBc99432dBec35cccF0e11Fbd913A24BA6b39";
const provider = new ethers.providers.JsonRpcProvider(GOERLI);
const wallet = new ethers.Wallet(PRIVATE, provider);
const liqContract = new ethers.Contract(liqContractAddr, liqAbi, wallet);

describe("ethers.js contracts test", () => {

    test("address", () => {
        console.log("address:%s", wallet.address)
    });

    test("estimateGas", async () => {
        const data = liqContract.interface.encodeFunctionData('stakeETH', ["0x892e7c8C5E716e17891ABf9395a0de1f2fc84786", 1]);

        const gas = await provider.estimateGas({
            from: wallet.address,
            to: liqContractAddr,
            data: data,
            value: ethers.utils.parseEther("1.0")
        });

        console.log(gas.toNumber());
    });

});


describe("web3.js contracts test", () => {
    const web3 = new Web3(new Web3.providers.HttpProvider(GOERLI));
    const liqContract = new web3.eth.Contract(liqAbi as any, liqContractAddr);

    test("estimateGas", async () => {
        const gas = await web3.eth.estimateGas({
            from: wallet.address,
            to: liqContractAddr,
            data: liqContract.methods.stakeETH("0x892e7c8C5E716e17891ABf9395a0de1f2fc84786", 1).encodeABI(),
            value: web3.utils.toWei("1", "ether")
        });

        console.log(gas);
    });

});
