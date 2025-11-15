const os = require("os");


class Logger {
  #isVerboseModeEnabled = false;
  #isQuietModeEnabled = false;

  static #instance = null;

  constructor(verbose = false, quiet = false) {
    this.#isVerboseModeEnabled = verbose;
    this.#isQuietModeEnabled = quiet;
    Logger.#instance = this;
  }

  static getLogger(verbose = false, quiet = false) {
    if (!this.#instance){
        this.#instance = new Logger(verbose, quiet);
    }
    
    return this.#instance;
  }

  /**
   * If "verbose" flag is set: log the message + log additional system data from the os module
   * If "quiet" flag is set: suppress the logging output
   *
   *  Example system data to log:
   * - Current timestamp
   * - Operating system platform
   * - Total memory
   * - Free memory
   * - CPU model
   */
  log(...data) {
    if (this.#isQuietModeEnabled){
      return;
    }

    if (this.#isVerboseModeEnabled) {
      const systemInfo = {
        timestamp: new Date().toISOString(),
        platform: os.platform(),
        totalMemory: os.totalmem(),
        freeMemory: os.freemem(),
        cpuModel: os.cpus()[0].model
      };

      console.log("[VERBOSE SYSTEM INFO]", systemInfo);
    }

    console.log(...data);
  }
}


function getLogger(verbose = false, quiet = false) {
    return Logger.getLogger(verbose, quiet);
}

module.exports = {getLogger}