let parsers = {

  defaultParser: (context, string) => {
    /*
      Parses a string of the type mybin::mykey into:
      {
        bin: mybin,
        key: mykey
      }
    */
    let [bin, key] = new RegExp('^(.*)' + context.sep + '(.*)$')
      .exec(string).slice(1, 3);
    return {bin, key};
  },

  urlParser: (context, string) => {
    /*
      Parses a url of the type /foo/bar/42 into:
      {
        bin: /foo/bar/,
        key: 42
      }
    */
    let key = /[^\/]*$/.exec(string)[0];
    let bin = string.slice(0, string.length - key.length);
    return {bin, key};
  }

};

let requireContext = (parser) => {
  return (...args) => {
    if (args.length !== 2)
      throw new Error('Parser requires the arguments (context, string).');
    return parser(...args);
  };
}

// Decorate parsers to require (context, string) arguments.
Object.keys(parsers).forEach((key) => {
  parsers[key] = requireContext(parsers[key]);
});

export let defaultParser = parsers.defaultParser;
export let urlParser = parsers.urlParser;
export default parsers;
