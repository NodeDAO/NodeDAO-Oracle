/**
 * desc: log config
 * @author renshiwei
 * Date: 2022/12/29 20:02
 **/

import {createLogger, format, transports} from 'winston';
import {config} from '../../config/config'

export const logger = createLogger({
    level: config.logLevel || process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    format: format.combine(
        // format.colorize(),
        format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss'
        }),
        format.errors({stack: true}),
        format.splat(),
        format.printf(
            (info) =>
                `${info.level}: ${[info.timestamp]}: ${info.message}`
        ),
        format.json(),
    ),
    transports: [new transports.Console({})],
});



