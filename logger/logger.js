const winston = require ('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const port = process.argv[2];

const logger = winston.createLogger({
    level: 'debug',
    format: winston.format.combine(winston.format.timestamp(),winston.format.splat(),winston.format.json()),
    defaultMeta: { service: 'Item' },
    transports: [
     // new winston.transports.File({ filename: `error_${port}.log`, level: 'error' }),
    //  new winston.transports.File({ filename: `combined_${port}.log` }),
	new DailyRotateFile({
		 filename: `logs/item_error_%DATE%_${port}.log`,
		 datePattern: 'YYYY-MM-DD',
		 zippedArchive: true,
		 maxSize: '50m',
		 maxFiles: '7d',
		 prepend: true,
		level: 'error',
	}),
	 new DailyRotateFile({
		                  filename: `logs/item_combined_%DATE%_${port}.log`,
		                  datePattern: 'YYYY-MM-DD',
		                  zippedArchive: true,
		                  maxSize: '50m',
		                  maxFiles: '7d',
		                  prepend: true,
		                 level: 'debug',
		         })
	
    ],
  });

  if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
      format: winston.format.simple(),
    }));
  }

  module.exports = logger;
