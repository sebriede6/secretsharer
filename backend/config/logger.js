import winston from 'winston';
import dotenv from 'dotenv';

dotenv.config();

const { combine, timestamp, printf, colorize, align } = winston.format;

const customFormat = printf(
  ({ level, message, timestamp: ts, ...metadata }) => {
    let msg = `${ts} [${level}]: ${message} `;
    if (metadata && Object.keys(metadata).length > 0) {
      const metaToLog = { ...metadata };
      delete metaToLog.level;
      delete metaToLog.message;
      delete metaToLog.timestamp;
      delete metaToLog.stack;
      if (Object.keys(metaToLog).length > 0) {
        msg += JSON.stringify(metaToLog);
      }
    }
    if (metadata.stack) {
      msg += `\nStack: ${metadata.stack}`;
    }
    return msg;
  }
);

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
  format: combine(
    colorize({ all: true }),
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    align(),
    customFormat
  ),
  transports: [new winston.transports.Console()],
  exceptionHandlers: [
    new winston.transports.Console({
      format: combine(
        colorize({ all: true }),
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        printf(
          (info) =>
            `${info.timestamp} [EXCEPTION] ${info.level}: ${info.message}\n${info.stack || ''}`
        )
      ),
    }),
  ],
  rejectionHandlers: [
    new winston.transports.Console({
      format: combine(
        colorize({ all: true }),
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        printf(
          (info) =>
            `${info.timestamp} [REJECTION] ${info.level}: ${info.message}\n${info.reason?.stack || info.reason || ''}`
        )
      ),
    }),
  ],
});

export default logger;
