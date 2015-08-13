// https://github.com/chuckremes/nn-core/blob/master/spec/nn_symbol_spec.rb

var nano = require('../');
var test = require('tape');
var symbols = require('./symbols');

test('retrieve symbol name/value', function (t) {
    var n = symbols.symbols.length;

    // useful for debugging the test
    //for(var j = 0; j < n; j++) {
        //var s = symbols.symbols[j];
        //console.log("LUT: %j", s);
    //}

    for(var i = 0; i < n; i++) {
        var ret = nano.symbol(i);
        t.ok(ret, 'symbol retrieved ok');
        //console.log("iDX %d, RET: %j", i, ret);

        for(var j = 0; j < n; j++) {
            var s = symbols.symbols[j];

            if(s.name == ret.name) {
                t.equal(s.value, ret.value);
                break;
            }
        }

        if(j == n) {
            t.fail("symbol not in LUT");
        }
    }
    t.end();
});
