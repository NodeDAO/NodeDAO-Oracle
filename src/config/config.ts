const yargs = require('yargs/yargs')

export const config = yargs(process.argv.slice(2))
    .options({
        'log.level': {
            type: 'string',
            default: 'info',
            demandOption: false
        },
        network: {
            type: 'string',
            default: 'mainnet',
            demandOption: false
        },
        beaconNodeAddr: {
            type: 'string',
            demandOption: true
        },
        executionLayerAddr: {
            type: 'string',
            demandOption: true
        },
        privateKey: {
            type: 'string',
            demandOption: true
        },
        // set --config default
        config: {
            type: 'string',
            default: process.env.NODE_ENV === 'production' ? 'src/config/config-default.json' : 'src/config/config-dev.json',
            demandOption: false
        },
    })
    .config()
    .argv;

process.on('uncaughtException', function (err) {
    console.error('uncaughtException', err.message);
});
