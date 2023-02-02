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


});
