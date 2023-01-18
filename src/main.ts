import {runReportBeacon} from './app/reportBeacon/reportBeacon';
import {logger} from "./lib/log/log";

async function main() {
    logger.info("start.. ")
    await runReportBeacon().then();
    logger.info("end.. ")
}

main();

