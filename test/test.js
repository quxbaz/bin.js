require('node_modules/chai').should();
import Bin from 'bin';

let LS = localStorage;
let str = obj => JSON.stringify(obj);
let parse = str => JSON.parse(str);

describe("lib/bin", () => {

  let bin;

  beforeEach(() => {
    LS.clear();
    bin = new Bin();
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

  it("Constructor populates cache with localStorage entries.", () => {
    LS.setItem('person', str({name: 'george'}));
    let bin = new Bin();
    bin.cache.should.eql({
      person: {
        name: 'george'
      }
    });
  });

  it("Defines a custom separator.", () => {
    let bin = new Bin({sep: '--'});
    bin.set('foo/bar', 'qux', {you: 'there'});
    parse(localStorage.getItem('foo/bar--qux')).should.eql({you: 'there'});
  });

  it("Calls .get() with a parser defined.", () => {
    let bin = new Bin({parser: Bin.URL_PARSER});
    bin.set('all/the/people/', '1', {yo: 'there'});
    bin.get('all/the/people/1').should.eql({yo: 'there'});
  });

  it("Calls .set() with a parser defined.", () => {
    let bin = new Bin({parser: Bin.URL_PARSER});
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
