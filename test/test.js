require('node_modules/chai').should();
import Bin from 'bin';
import parsers from 'bin/lib/parsers';

let LS = localStorage;
let str = obj => JSON.stringify(obj);
let parse = str => JSON.parse(str);

describe("lib/bin", () => {

  let bin;

  beforeEach(() => {
    LS.clear();
    bin = new Bin();
  });

  it("Checks that Bin.<parser> is the actual <parser>.", () => {
    Bin.defaultParser.should.eql(parsers.defaultParser);
    Bin.urlParser.should.eql(parsers.urlParser);
  });

  it("Stores an object in localStorage.", () => {
    bin.set('cats', 'grumbles', {
      name: 'grumbles',
      food: 'tuna'
    });
    let cat = bin.get('cats', 'grumbles').should.eql({
      name: 'grumbles',
      food: 'tuna'
    });
    parse(LS.getItem('cats::grumbles')).should.eql({
      name: 'grumbles',
      food: 'tuna'
    });
  });

  it("Loads objects from localStorage.", () => {
    LS.setItem('foo::1', str({foo: 'bar'}));
    bin.loadLS();
    bin.get('foo::1').should.eql({foo: 'bar'});
  });

  it("Empties the cache when reloading localStorage.", () => {
    bin.cache['foo::1'] = {foo: 'bar'};
    bin.get('foo', 1).should.eql({foo: 'bar'});
    bin.reloadLS();
    (bin.get('foo', 1) === undefined).should.be.true;
  });

  it("Gets all objects from a bin.", () => {
    bin.set('cats', '1', {name: 'mittens'});
    bin.set('cats', '2', {name: 'buttons'});
    bin.set('cats', '3', {name: 'heartburn'});
    bin.all('cats').should.eql([
      {name: 'mittens'},
      {name: 'buttons'},
      {name: 'heartburn'}
    ]);
    Object.keys(LS).map(key => parse(LS.getItem(key))).should.eql([
      {name: 'mittens'},
      {name: 'buttons'},
      {name: 'heartburn'}
    ]);
  });

  it("Clears the cache and localStorage.", () => {
    LS.setItem('a::1', str({a: 1}));
    bin = new Bin();
    bin.cache['a::2'] = {a: 2};
    bin.clear();
    Object.keys(LS).length.should.eql(0);
    Object.keys(bin.cache).length.should.eql(0);
  });

  it("Constructor populates cache with localStorage entries.", () => {
    LS.setItem('person::1', str({name: 'george'}));
    let bin = new Bin();
    bin.cache.should.eql({
      'person::1': {
        name: 'george'
      }
    });
  });

  it("Throws an error when parsing bad JSON.", () => {
    LS.setItem('a::1', {a:1});  // This is stored as "[object Object]"
    (() => {
      bin.reloadLS();
    }).should.throw(SyntaxError);
  });

  it("Defines a custom separator.", () => {
    let bin = new Bin({sep: '--'});
    bin.set('foo/bar', 'qux', {you: 'there'});
    parse(localStorage.getItem('foo/bar--qux')).should.eql({you: 'there'});
  });

  it("Throws an error when a parser isn't called with exactly two arguments.", () => {
    (() => parsers.urlParser()).should.throw();
    (() => parsers.urlParser({})).should.throw();
    (() => parsers.urlParser({sep: '::'}, 'a::b')).should.not.throw();
  });

  it("Calls .get() with a parser defined.", () => {
    let bin = new Bin({parser: parsers.urlParser});
    bin.set('all/the/people/', '1', {yo: 'there'});
    bin.get('all/the/people/1').should.eql({yo: 'there'});
  });

  it("Calls .set() with a parser defined.", () => {
    let bin = new Bin({parser: parsers.urlParser});
    bin.set('all/the/people/1', {hey: 'you'});
    bin.get('all/the/people/1').should.eql({hey: 'you'});
    bin.get('all/the/people/', 1).should.eql({hey: 'you'});
  });

  describe("bin#set", () => {
    it("Sets a value in cache and localStorage.", () => {
      bin.set('dogs', 'poochy', {name: 'poochy'});
      bin.get('dogs', 'poochy').should.eql({name: 'poochy'});
      bin.cache['dogs::poochy'].should.eql({name: 'poochy'});
      parse(LS.getItem('dogs::poochy')).should.eql({name: 'poochy'});
    });
  });

  it('Calls .set() and .get() with the default parser.', () => {
    bin.set('favorites::food', {oats: 'oats'});
    bin.get('favorites::food').should.eql({oats: 'oats'});
  });

  it("Deletes a key from the cache and localStorage.", () => {
    bin.set('dogs', 'bowow', {food: 'kibble'});
    bin.erase('dogs::bowow');
    (bin.get('dogs', 'bowow') === undefined).should.be.true;
  });

});
