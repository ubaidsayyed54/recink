'use strict';

const Terraform = require('../terraform');

/**
 * Terraform state
 */
class State {
  /**
   * @param {string} path 
   * @param {string} backupPath
   */
  constructor(path, backupPath) {
    this._path = path;
    this._backupPath = backupPath;
  }

  /**
   * @returns {string}
   */
  get path() {
    return this._path;
  }

  /**
   * @returns {string}
   */
  get backupPath() {
    return this._backupPath;
  }
}

module.exports = State;
