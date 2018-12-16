const winston = require('winston')
const config = require('../config/config.js')

module.exports = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
      winston.format.timestamp(),
     
    ),
    transports: [
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.timestamp(),
          winston.format.printf(info => {
            return `${info.timestamp} ${info.level}: ${info.message}`
          }),
        ),
      }),
      new winston.transports.File({ 
        filename: config.out_log,
        format: winston.format.json()
      }),
      new winston.transports.File({ 
        filename: config.err_log,
        level: 'error',
        format: winston.format.json()
      })
    ]
})


