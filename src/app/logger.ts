import winston from 'winston';

const { combine, timestamp, label, printf, colorize } = winston.format;

const logFormat = printf(({ level, message, label, timestamp }) => {
  return `${timestamp} [${label}] ${level}: ${message}`;
});

export const logIndexer = makeLogger('indexer');

export const logRecommender = makeLogger('recommender');

function makeLogger(logLabel: string) {
  const logger = winston.createLogger({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    format: combine(
      colorize(),
      label({ label: logLabel }),
      timestamp(),
      logFormat
    ),
    transports: [
      process.env.NODE_ENV === 'production'
        ? new winston.transports.File({ filename: 'logs/info.log' })
        : new winston.transports.Console(),
    ],
  });
  return logger;
}
