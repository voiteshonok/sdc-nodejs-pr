const winston = require('winston');
const path = require('path');
const fs = require('fs');

// Ensure logs directory exists in production
const logsDir = path.join(__dirname, '../../logs');
if (process.env.NODE_ENV === 'production' && !fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

class Logger {
  #isVerboseModeEnabled = false;
  #isQuietModeEnabled = false;
  #winstonLogger = null;

  static #instance = null;

  constructor(verbose = false, quiet = false) {
    this.#isVerboseModeEnabled = verbose;
    this.#isQuietModeEnabled = quiet;
    
    // Configure winston based on environment
    const isProduction = process.env.NODE_ENV === 'production';
    
    const transports = [];
    
    if (isProduction) {
      // Production: log to files
      // Combined log file (all logs: info, errors, fatal, debug, etc.)
      transports.push(
        new winston.transports.File({
          filename: path.join(logsDir, 'combined.log'),
          level: 'debug',
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.errors({ stack: true }),
            winston.format.json()
          )
        })
      );
      
      // Error log file (only errors and fatal)
      transports.push(
        new winston.transports.File({
          filename: path.join(logsDir, 'error.log'),
          level: 'error',
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.errors({ stack: true }),
            winston.format.json()
          )
        })
      );
    } else {
      // Development: log to console with simple format
      transports.push(
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
            winston.format.printf(({ timestamp, level, message, ...meta }) => {
              let msg = `${timestamp} [${level}]: ${message}`;
              if (Object.keys(meta).length > 0) {
                msg += ` ${JSON.stringify(meta)}`;
              }
              return msg;
            })
          )
        })
      );
    }
    
    this.#winstonLogger = winston.createLogger({
      level: verbose ? 'debug' : 'info',
      transports: transports,
      exitOnError: false
    });
    
    Logger.#instance = this;
  }

  static getLogger(verbose = false, quiet = false) {
    if (!this.#instance) {
      this.#instance = new Logger(verbose, quiet);
    }
    
    return this.#instance;
  }

  /**
   * Log at info level (default for backward compatibility)
   * Supports multiple arguments like console.log
   */
  log(...data) {
    if (this.#isQuietModeEnabled) {
      return;
    }

    if (this.#isVerboseModeEnabled && process.env.NODE_ENV !== 'production') {
      const os = require('os');
      const systemInfo = {
        timestamp: new Date().toISOString(),
        platform: os.platform(),
        totalMemory: os.totalmem(),
        freeMemory: os.freemem(),
        cpuModel: os.cpus()[0]?.model || 'Unknown'
      };
      this.#winstonLogger.info('[VERBOSE SYSTEM INFO]', systemInfo);
    }

    // Join all arguments into a single message
    const message = data.map(item => 
      typeof item === 'object' ? JSON.stringify(item, null, 2) : String(item)
    ).join(' ');
    
    this.#winstonLogger.info(message);
  }

  /**
   * Log at info level
   */
  info(...data) {
    if (this.#isQuietModeEnabled) {
      return;
    }
    const message = data.map(item => 
      typeof item === 'object' ? JSON.stringify(item, null, 2) : String(item)
    ).join(' ');
    this.#winstonLogger.info(message);
  }

  /**
   * Log at error level
   */
  error(...data) {
    if (this.#isQuietModeEnabled) {
      return;
    }
    const message = data.map(item => 
      typeof item === 'object' ? JSON.stringify(item, null, 2) : String(item)
    ).join(' ');
    this.#winstonLogger.error(message);
  }

  /**
   * Log at warn level
   */
  warn(...data) {
    if (this.#isQuietModeEnabled) {
      return;
    }
    const message = data.map(item => 
      typeof item === 'object' ? JSON.stringify(item, null, 2) : String(item)
    ).join(' ');
    this.#winstonLogger.warn(message);
  }

  /**
   * Log at debug level
   */
  debug(...data) {
    if (this.#isQuietModeEnabled) {
      return;
    }
    const message = data.map(item => 
      typeof item === 'object' ? JSON.stringify(item, null, 2) : String(item)
    ).join(' ');
    this.#winstonLogger.debug(message);
  }

  /**
   * Log at fatal/critical level (maps to error in winston)
   */
  fatal(...data) {
    if (this.#isQuietModeEnabled) {
      return;
    }
    const message = data.map(item => 
      typeof item === 'object' ? JSON.stringify(item, null, 2) : String(item)
    ).join(' ');
    this.#winstonLogger.error(`[FATAL] ${message}`);
  }
}

function getLogger(verbose = false, quiet = false) {
  return Logger.getLogger(verbose, quiet);
}

module.exports = { getLogger };