/*
  bin.js

  A LocalStorage wrapper that supports sub-containers.

  <API>
  bin.get(bin, key)
  bin.set(bin, key, value)
  bin.all(bin)
*/

import {defaultParser} from './parsers';

const LS = localStorage;

export default class Bin {

  constructor(options={}) {
    this.cache = {};
    this.sep = options.sep || '::';
    this.parser = options.parser || defaultParser;
    this.loadLS();
  }

  loadLS() {
    Object.keys(LS).forEach((key) => {
      let parsed = this.parser(this, key);
      if (parsed.bin && parsed.key) {
        try {
          this.cache[key] = JSON.parse(LS.getItem(key));
        } catch (error) {
          if (error instanceof SyntaxError) {
            throw new SyntaxError(`Found bad JSON in localStorage. Possibly
            an object was stored without stringifying/serializing
            first.`);
          }
        }
      }
    });
  }

  reloadLS() {
    /*
      Clears the cache and reloads all objects from localStorage.
    */
    this.cache = {};
    this.loadLS();
  }

  clear() {
    /*
      Clears the cache AND localStorage.
    */
    this.cache = {};
    localStorage.clear();
  }

  set(bin, key, value) {
    if (value !== undefined) {
      let q = this.queryString(bin, key);
      this.cache[q] = value;
      LS.setItem(q, JSON.stringify(value));
    } else if (this.parser) {
      let parsed = this.parser(this, bin);
      return this.set(parsed.bin, parsed.key, key);  // @key should actually be called @value here.
    }
  }

  get(bin, key) {
    if (key !== undefined)
      return this.cache[this.queryString(bin, key)];
    else if (this.parser) {
      let parsed = this.parser(this, bin);
      return this.get(parsed.bin, parsed.key);
    }
  }

  erase(bin, key) {
    if (key !== undefined) {
      let q = this.queryString(bin, key);
      delete this.cache[q];
      LS.removeItem(q);
    }
    else if (this.parser) {
      let parsed = this.parser(this, bin);
      return this.erase(parsed.bin, parsed.key);
    }
  }

  all(bin) {
    /*
      Gets all objects from a bin.
    */
    return Object.keys(this.cache).filter(
      wholeKey => new RegExp('^' + bin + this.sep).test(wholeKey)
    ).map(wholeKey => this.cache[wholeKey]);
  }

  queryString(bin, key) {
    return bin + this.sep + key;
  }

}
