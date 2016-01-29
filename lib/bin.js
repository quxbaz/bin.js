/*
  bin.js

  A LocalStorage wrapper that supports sub-containers.

  <API>
  bin.get(bin, key)
  bin.set(bin, key, value)
  bin.all(bin)
*/


const LS = localStorage;

export default class Bin {

  constructor(options={}) {
    this.cache = {};
    // Cache all of localStorage up-front.
    Object.keys(LS).forEach((key) => {
      this.cache[key] = JSON.parse(LS.getItem(key));
    });
    this.sep = options.sep || '::';
    this.parser = options.parser || Bin.DEFAULT_PARSER;
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
    return Object.keys(this.cache).filter(
      wholeKey => new RegExp('^' + bin + this.sep).test(wholeKey)
    ).map(wholeKey => this.cache[wholeKey]);
  }

  queryString(bin, key) {
    return bin + this.sep + key;
  }

}

/*
  Parses a string of the type mybin::mykey into:
  {
    bin: mybin,
    key: mykey
  }
*/
Bin.DEFAULT_PARSER = (context, string) => {
  let [bin, key] = new RegExp('^(.*)' + context.sep + '(.*)$')
    .exec(string).slice(1, 3);
  return {bin, key};
};

/*
  Parses a url of the type /foo/bar/42 into:
    {
      bin: /foo/bar/,
      key: 42
    }
*/
Bin.URL_PARSER = (context, string) => {
  let key = /[^\/]*$/.exec(string)[0];
  let bin = string.slice(0, string.length - key.length);
  return {bin, key};
}
