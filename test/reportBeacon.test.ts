/**
 * desc:
 * @author renshiwei
 * Date: 2023/1/12 14:25
 **/

import {describe, jest, test} from '@jest/globals'
import {logger} from '../src/lib/log/log'
import {buildReportBeacon, ReportBeacon, runReportBeacon} from '../src/app/reportBeacon/reportBeacon'
import {ServiceException} from '../src/lib/error/serviceException'
import {ethers} from 'ethers'

describe("reportBeacon", () => {
    jest.setTimeout(500000);

    test("buildReportBeacon", async () => {
        let reportBeaconRes: ReportBeacon = new ReportBeacon(ethers.BigNumber.from("0"), ethers.BigNumber.from("0"), 0, "");

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

    test("reportBeacon", async () => {
        logger.info("start.. ")
        await runReportBeacon().then();
        logger.info("end.. ")
    });


});
