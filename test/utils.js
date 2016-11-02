var utils = require('../utils');
var should = require('should');
var error = require('../lib/error');

suite('Utils', function() {
  test('argsToArray', function() {
    (function() {
      should.deepEqual(utils.argsToArray(arguments), [1, 2, 3]);
    })(1, 2, 3);
  });

  test('cleanFloat', function() {
    utils.cleanFloat(3.0999999999999996).should.equal(3.1);
  });

  test('parseBool', function() {
    utils.parseBool(true).should.equal(true);
    utils.parseBool(0).should.equal(false);
    utils.parseBool(1).should.equal(true);
    utils.parseBool('TRUE').should.equal(true);
    utils.parseBool('FALSE').should.equal(false);
    utils.parseBool(new Date()).should.equal(true);
    utils.parseBool(NaN).should.equal(true);
    var err = new Error();
    utils.parseBool(err).should.equal(err);
  });

  test('parseNumber', function() {
    utils.parseNumber(2).should.equal(2);
    utils.parseNumber('2').should.equal(2);
    utils.parseNumber('string').should.equal(error.value);
    utils.parseNumber(true).should.equal(1);
    utils.parseNumber(false).should.equal(0);
    utils.parseNumber(null).should.equal(0);
    utils.parseNumber(undefined).should.equal(0);
    utils.parseNumber(error.na).should.equal(error.na);
  });

  test('parseNumbers', function() {
    utils.parseNumbers(2).should.eql(error.value);
    utils.parseNumbers(error.na).should.eql(error.na);
    utils.parseNumbers([2]).should.eql([2]);
    utils.parseNumbers(['2']).should.eql([]);
    utils.parseNumbers(['string']).should.eql([]);
    utils.parseNumbers([true]).should.eql([]);
    utils.parseNumbers([false]).should.eql([]);
    utils.parseNumbers([null]).should.eql([]);
    utils.parseNumbers([undefined]).should.eql([]);
    utils.parseNumbers([error.na]).should.eql(error.na);
  });

  test('parseNumbersA', function() {
    utils.parseNumbersA(2).should.eql(error.value);
    utils.parseNumbersA(error.na).should.eql(error.na);
    utils.parseNumbersA([2]).should.eql([2]);
    utils.parseNumbersA(['2']).should.eql([0]);
    utils.parseNumbersA(['string']).should.eql([0]);
    utils.parseNumbersA([true]).should.eql([1]);
    utils.parseNumbersA([false]).should.eql([0]);
    utils.parseNumbersA([null]).should.eql([]);
    utils.parseNumbersA([undefined]).should.eql([]);
    utils.parseNumbersA([error.na]).should.eql(error.na);
  });

  test('parseNumbersConvert', function() {
    utils.parseNumbersConvert(2).should.eql(error.value);
    utils.parseNumbersConvert(error.na).should.eql(error.na);
    utils.parseNumbersConvert([2]).should.eql([2]);
    utils.parseNumbersConvert(['2']).should.eql([2]);
    utils.parseNumbersConvert(['string']).should.eql(error.value);
    utils.parseNumbersConvert([true]).should.eql(error.value);
    utils.parseNumbersConvert([false]).should.eql(error.value);
    utils.parseNumbersConvert([null]).should.eql([0]);
    utils.parseNumbersConvert([undefined]).should.eql([0]);
    utils.parseNumbersConvert([error.na]).should.eql(error.na);
  });

  test('parseNumbersX', function() {
    utils.parseNumbersA(2, 2).should.eql(error.value);
    utils.parseNumbersA(error.na, error.na).should.eql(error.na);
    utils.parseNumbersX([2], [2]).should.eql([[2],[2]]);
    utils.parseNumbersX(['2'], ['2']).should.eql([[], []]);
    utils.parseNumbersX(['string'], ['string']).should.eql([[], []]);
    utils.parseNumbersX([true], [true]).should.eql([[], []]);
    utils.parseNumbersX([false], [false]).should.eql([[], []]);
    utils.parseNumbersX([null], [null]).should.eql([[], []]);
    utils.parseNumbersX([undefined], [undefined]).should.eql([[], []]);
    utils.parseNumbersX([error.na], [error.na]).should.eql(error.na);
  });

  test('parseMatrix', function() {
    utils.parseMatrix(1).should.eql([[1]]);
  });

  test('parseText', function() {
    utils.parseText(null).should.equal('');
    utils.parseText('string').should.equal('string');
    utils.parseText(123).should.equal('123');
    utils.parseText(true).should.equal('TRUE');
    utils.parseText(false).should.equal('FALSE');
    utils.parseText([1]).should.equal(error.value);
    utils.parseText(error.na).should.equal(error.na);
  });

  suite('parseDate', function() {
    test('returns Date object equal to input Date object', function () {
      utils.parseDate(new Date(2000, 2, 3)).should.eql(new Date(2000, 2, 3));
    });
    test('returns Date object equal to Excel timestamp', function () {
      utils.parseDate(36559.5).should.eql(new Date(Date.parse("2000-02-03 12:00:00 GMT")));
    });
    test('returns Date object equal to Excel timestamp string', function () {
      utils.parseDate('36559.5').should.eql(new Date(Date.parse("2000-02-03 12:00:00 GMT")));
    });
    test('parses required date/time formats', function () {
      var expected = new Date(Date.parse("2000-2-3 13:00 GMT")).getTime();
      utils.parseDate('2/3/2000 13:00').getTime().should.equal(expected);
      utils.parseDate('02/03/2000 13:00:00').getTime().should.equal(expected);
      utils.parseDate('2000-2-3 13:00:00.0').getTime().should.equal(expected);
      utils.parseDate('2000-02-03 13:00').getTime().should.equal(expected);
      utils.parseDate('2000-feb-03 13:00').getTime().should.equal(expected);
      utils.parseDate('2000-FEB-03 13:00').getTime().should.equal(expected);
      utils.parseDate('February 3, 2000 13:00').getTime().should.equal(expected);
      utils.parseDate('february 3, 2000 13:00').getTime().should.equal(expected);
    });
    test('returns num error for negative number', function () {
      utils.parseDate(-1).should.eql(error.num);
    });
    test('returns value error for invalid date format', function () {
      utils.parseDate('0/0/0').should.eql(error.value);
    });
  });

  suite('excelToJsTimestamp', function () {
      test('February 3, 2001', function () {
          utils.excelToJsTimestamp(36925).should.equal(Date.UTC(2001, 1, 3));
      });
      test('January 1, 1900', function () {
          utils.excelToJsTimestamp(1).should.equal(Date.UTC(1900, 0, 1));
      });
  });

  suite('jsToExcelTimestamp', function () {
      test('February 3, 2001', function () {
          utils.jsToExcelTimestamp(Date.UTC(2001, 1, 3)).should.equal(36925);
      });
      test('January 1, 1900', function () {
          utils.jsToExcelTimestamp(Date.UTC(1900, 0, 1)).should.equal(1);
      });
  });
});
