/**
 * desc:
 * @author renshiwei
 * Date: 2023/1/12 14:25
 **/

import {describe, jest, test} from '@jest/globals'
import {logger} from '../src/lib/log/log'
import {
    buildReportBeacon,
    buildReportBeaconAndMerkleTree,
    dealExpectedEpochId,
    ReportBeacon,
    reportSuccessEvent,
    runReportBeacon
} from '../src/app/reportBeacon/reportBeacon'
import {ServiceException} from '../src/lib/error/serviceException'
import {ethers} from 'ethers'
import {sleep} from '../dist/tsc/lib/utils/sleep'
import {StandardMerkleTree} from '@openzeppelin/merkle-tree'


describe("reportBeacon test", () => {
    jest.setTimeout(5000000);

    test("buildReportBeacon", async () => {
        let reportBeaconRes: ReportBeacon = new ReportBeacon(ethers.BigNumber.from("0"), ethers.BigNumber.from("0"), ethers.BigNumber.from("0"), "");

        await buildReportBeacon().then(r => {
            reportBeaconRes = r;
        }).catch(e => {
            logger.error("buildReportBeacon error. reportBeaconRes:", reportBeaconRes, e)
            if (e instanceof ServiceException) {
                throw new ServiceException(e.code, e.message);
            }
        })

        logger.debug("reportBeaconRes:", reportBeaconRes)
    });

    test("buildReportBeaconAndMerkleTree", async () => {
        let reportBeaconRes: ReportBeacon = new ReportBeacon(ethers.BigNumber.from("0"), ethers.BigNumber.from("0"), ethers.BigNumber.from("0"), "");
        let tree: any = null;
        await buildReportBeaconAndMerkleTree(ethers.BigNumber.from("153185")).then(r => {
            reportBeaconRes = r.reportBeaconRes;
            tree = r.tree;
        }).catch(e => {
            logger.error("buildReportBeacon error. reportBeaconRes:", reportBeaconRes, e)
            if (e instanceof ServiceException) {
                throw new ServiceException(e.code, e.message);
            }
        })

        if (tree instanceof StandardMerkleTree<string[]>) {
            console.log(tree.root)
        }

        console.log("reportBeaconRes:", reportBeaconRes)
    });

    test("reportBeacon oracle", async () => {
        logger.info("start.. ")
        await runReportBeacon().then();

        reportSuccessEvent();

        await sleep(10000)
        logger.info("end.. ")
    });

    test("dealExpectedEpochId", async () => {
        logger.info("start.. ")
        let expectEpochId: ethers.BigNumber = ethers.BigNumber.from("0");
        await dealExpectedEpochId().then((epoch: ethers.BigNumber) => {
            expectEpochId = epoch;
            logger.debug("report expectEpochId:%i", expectEpochId);
        }).catch((e => {
            logger.error("[reportBeacon error for getExpectedEpochId] err:%s", e);
        }));

        console.log(expectEpochId.toString());
        logger.info("end.. ")
    });

});
