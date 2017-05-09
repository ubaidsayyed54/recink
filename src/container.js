'use strict';

const dot = require('dot-object');

class Container {
  /**
   * @param {*} config
   */
  constructor(config = {}) {
    this._config = config;
  }
  
  /**
   * @param {*} config
   *
   * @returns Container
   */
  reload(config) {
    this._config = config;
    
    return this;
  }
  
  /**
   * @returns {Array}
   */
  listKeys() {
    return Object.keys(this._config);
  }
  
  /**
   * @param {string} path
   * @param {*} value
   *
   * @returns Container
   */
  set(path, value) {
    dot.str(path, value, this._config);
    
    return this;
  }
  
  /**
   * @param {string} path
   * @param {*} defaultValue
   *
   * @returns {*}
   */
  get(path, defaultValue = null) {
    if (!this.has(path)) {
      return defaultValue;
    }
    
    return dot.pick(path, this._config);
  }
  
  /**
   * @param {string} path
   *
   * @returns {boolean}
   */
  has(path) {
    return typeof dot.pick(path, this._config) !== 'undefined';
  }
  
  /**
   * @returns {*}
   */
  get raw() {
    return this._config
  }
}

module.exports = Container;
