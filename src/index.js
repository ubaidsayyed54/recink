'use strict';

const path = require('path');
const EventEmitter = require('events');
const events = require('./events');
const configFactory = require('./config/factory');
const Container = require('./container');
const AbstractComponent = require('./component/abstract-component');
const logger = require('./logger');

class Deepstiny extends EventEmitter {
  constructor() {
    super();
    
    this._config = {};
    this._components = [];
    this._container = new Container(this._config);
    
    this._registerDebugers();
  }
  
  /**
   * @private
   */
  _registerDebugers() {
    this.on(events.config.load, (container, configFile) => {
      logger.info(logger.emoji.smiley, `Load config from ${ configFile }`);
      logger.debug(JSON.stringify(container.raw, null, '  '));
    });
    
    this.on(events.components.load, (...components) => {
      logger.debug(
        'Loading components -',
        components.map(c => c.name).join(', ') || 'None'
      );
    });
    
    this.on(events.component.load, component => {
      logger.debug(`Load component ${ component.name }`);
    });
    
    this.on(events.component.subscribe, component => {
      logger.debug(`Component ${ component.name } is subscribed`);
    });
    
    this.on(events.component.ready, component => {
      logger.debug(`Component ${ component.name } is ready`);
    });
    
    this.on(events.components.run, (...components) => {
      components.map(component => {
        logger.info(
          component.isActive ? logger.emoji.check : logger.emoji.cross,
          `${ component.name } component`
        );
      });
    });
  }
  
  /**
   * @returns {Promise|*}
   */
  run() {
    this.emit(events.components.run, ...this._components);
    
    const activeComponents = this._components
      .filter(component => component.isActive);
      
    if (activeComponents.length <= 0) {
      return Promise.resolve();
    }
    
    return Promise.all(activeComponents.map(component => {
      this.emit(events.component.run, component);
      
      return component.run(this);
    }));
  }
  
  /**
   * @param {AbstractComponent[]|AbstractComponent|*} components
   *
   * @returns {Promise|*}
   */
  components(...components) {
    this.emit(events.components.load, ...components);
    
    if (components.length <= 0) {
      return Promise.resolve();
    }
    
    return Promise.all(components.map(component => {
      if (!component instanceof AbstractComponent) {
        return Promise.reject(new Error(
          `Component ${ component.constructor.name } should be an instance of AbstractComponent`
        ));
      }
      
      component.setLogger(logger);
      this._components.push(component);
      this.emit(events.component.load, component);
      
      return component.subscribe(this)
        .then(() => {
          this.emit(events.component.subscribe, component, this);
        })
        .then(() => component.ready())
        .then(() => {
          this.emit(events.component.ready, component);
          
          return Promise.resolve(component);
        });
    }));
  }
  
  /**
   * @param {string} configFile
   *
   * @returns {Promise|*}
   */
  configure(configFile = Deepstiny.CONFIG_FILE) {
    return configFactory.guess(configFile)
      .load()
      .then(config => {
        this._config = config;
        this._container.reload(this._config);
        
        this.emit(events.config.load, this.container, configFile);
      });
  }
  
  /**
   * @returns {Container|*}
   */
  get container() {
    return this._container;
  }
  
  /**
   * @returns {AbstractConfig|*}
   */
  get config() {
    return this._config;
  }
  
  /**
   * @returns {string}
   */
  static get CONFIG_FILE() {
    return path.resolve(process.cwd(), this.CONFIG_FILE_NAME);
  }
  
  /**
   * @returns {string}
   */
  static get CONFIG_FILE_NAME() {
    return '.dps.yml';
  }
}

module.exports = { Deepstiny, events };
