import {config} from './config/config';

function main() {
    console.log(config.network);
    console.log(config.beaconNodeAddr);
    console.log(config.log.level);
}

main();

