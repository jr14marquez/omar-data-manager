const winston = require('winston')
const config = require('../config/config.js')


var logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
      winston.format.timestamp(),
    ),
    transports: [
      new winston.transports.File({ 
        filename: config.out_log,
        format: winston.format.json()
      }),
    ]
})

// If DEBUG is turned on then log to the `console`
// 
if (config.dbg) {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.timestamp(),
      winston.format.printf(info => {
        return `${info.timestamp} ${info.level}: ${info.message}`
      }),
    )
  }));
}

module.exports = logger


