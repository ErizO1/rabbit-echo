const LOG_LEVELS = {
  VERBOSE: 6,
  DEBUG: 5,
  LOG: 4,
  INFO: 3,
  WARNING: 2,
  ERROR: 1,
}

export default class Log {
  constructor() {
    if (!LOG_LEVELS[process.env['LOG_LEVEL']]) {
      console.warn('[W] Log level not specified or not supported, defaulting to LOG');
    } else {
      this.#logLevel = LOG_LEVELS[process.env['LOG_LEVEL']]
    }
  }

  #logLevel = LOG_LEVELS['LOG'];

  // Verbose
  V(message) {
    if (this.#logLevel >= LOG_LEVELS['VERBOSE']) {
      console.debug(`[V] ${message}`);
    }
  }

  // Debug
  D(message) {
    if (this.#logLevel >= LOG_LEVELS['DEBUG']) {
      console.debug(`[D] ${message}`);
    }
  }

  // Log
  L(message) {
    if (this.#logLevel >= LOG_LEVELS['LOG']) {
      console.log(`[L] ${message}`);
    }
  }

  // Info
  I(message) {
    if (this.#logLevel >= LOG_LEVELS['INFO']) {
      console.info(`[I] ${message}`);
    }
  }

  // Warning
  W(message) {
    if (this.#logLevel >= LOG_LEVELS['WARNING']) {
      console.warn(`[W] ${message}`);
    }
  }

  // Error
  E(message) {
    if (this.#logLevel >= LOG_LEVELS['ERROR']) {
      console.error(`[E] ${message}`);
    }
  }
}