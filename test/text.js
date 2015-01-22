var error = require('../lib/error');
var should = require('should');
var text = require('../lib/text');

suite('Text', function() {
  test('ASC', function() {
    text.ASC.should.throw('ASC is not implemented');
  });

  test('BAHTTEXT', function() {
    text.BAHTTEXT.should.throw('BAHTTEXT is not implemented');
  });

  test("CHAR", function() {
    text.CHAR(65).should.equal('A');
    text.CHAR(255).should.equal('ÿ');
    text.CHAR(0).should.equal(error.value);
    text.CHAR('invalid').should.equal(error.value);
  });

  test('CLEAN', function() {
    text.CLEAN('Monthly Report').should.equal('Monthly Report');
    text.CLEAN(text.CHAR(1)).should.equal('');
    text.CLEAN([1]).should.equal(error.value);
  });

  test('CODE', function() {
    text.CODE('A').should.equal(65);
    text.CODE('Ϩ').should.equal(1000);
    text.CODE(1).should.equal(49);
  });

  test('CONCATENATE', function() {
    text.CONCATENATE('hello', ' ', 'world').should.equal('hello world');
    text.CONCATENATE(1, 'one').should.equal('1one');
    text.CONCATENATE(true, 'yes').should.equal('TRUEyes');
    text.CONCATENATE(false, 'no').should.equal('FALSEno');
    text.CONCATENATE(false, 'no').should.equal('FALSEno');
    text.CONCATENATE(false, error.na).should.equal(error.na);
  });

  test('DBCS', function() {
    text.DBCS.should.throw('DBCS is not implemented');
  });

  test('DOLLAR', function() {
    text.DOLLAR(1234.567).should.equal('$1,234.57');
    text.DOLLAR(1234.567, -2).should.equal('$1,200');
    text.DOLLAR(-1234.567, -2).should.equal('($1,200)');
    text.DOLLAR(-0.123, 4).should.equal('($0.1230)');
    text.DOLLAR(-99.888).should.equal('($99.89)');
    text.DOLLAR('invalid').should.equal(error.value);
  });

  test('EXACT', function() {
    text.EXACT('yes', 'yes').should.equal(true);
  });

  test('FIND', function() {
    var data = 'Miriam McGovern';
    text.FIND('M', data).should.equal(1);
    text.FIND('m', data).should.equal(6);
    text.FIND('M', data, 3).should.equal(8);
  });

  test('FIXED', function() {
    text.FIXED(1234.567, 1).should.equal('1,234.6');
    text.FIXED(1234.567, -1).should.equal('1,230');
    text.FIXED(-1234.567, -1, true).should.equal('-1230');
    text.FIXED(44.332).should.equal('44.33');
    text.FIXED('invalid').should.equal(error.value);
  });

  test('LEFT', function() {
    text.LEFT('Sale Price', 4).should.equal('Sale');
    text.LEFT('Sweeden').should.equal('S');
    text.LEFT(3).should.equal(error.value);
  });

  test('LEN', function() {
    text.LEN('four').should.equal(4);
    text.LEN().should.equal(error.value);
  });

  test("LOWER", function() {
    text.LOWER('abcd').should.equal("abcd");
    text.LOWER('ABcd').should.equal("abcd");
    text.LOWER('ABCD').should.equal("abcd");
    text.LOWER('').should.equal("");
    text.LOWER().should.equal(error.value);
  });

  test('MID', function() {
    var data = 'Fluid Flow';
    text.MID(data, 1, 5).should.equal('Fluid');
    text.MID(data, 7, 20).should.equal('Flow');
    text.MID(data, 20, 50).should.equal('');
    text.MID(0).should.equal(error.value);
  });

  test('NUMBERVALUE', function() {
    text.NUMBERVALUE.should.throw('NUMBERVALUE is not implemented');
  });

  test('PRONETIC', function() {
    text.PRONETIC.should.throw('PRONETIC is not implemented');
  });

  test('PROPER', function() {
    text.PROPER('a title case').should.equal('A Title Case');
    text.PROPER(true).should.equal('True');
    text.PROPER(false).should.equal('False');
    text.PROPER(90).should.equal('90');
    text.PROPER(NaN).should.equal(error.value);
    text.PROPER().should.equal(error.value);
  });

  test('REPLACE', function() {
    text.REPLACE('abcdefghijk', 6, 5, '*').should.equal('abcde*k');
    text.REPLACE('2009', 3, 2, '10').should.equal('2010');
    text.REPLACE('123456', 1, 3, '@').should.equal('@456');
    text.REPLACE().should.equal(error.value);
  });

  test('REPT', function() {
    text.REPT('multiple ', 3).should.equal('multiple multiple multiple ');
    text.REPT('m').should.equal('');
  });

  test('RIGHT', function() {
    text.RIGHT('Sale Price', 5).should.equal('Price');
    text.RIGHT('Stock Number').should.equal('r');
    text.RIGHT('something', 'invalid').should.equal(error.value);
  });

  test('SEARCH', function() {
    text.SEARCH('e', 'Statements', 6).should.equal(7);
    text.SEARCH('margin', 'Profit Margin').should.equal(8);
    text.SEARCH(true, 'bool').should.equal(error.value);
  });

  test("SUBSTITUTE", function() {
    text.SUBSTITUTE('Jim Alateras', 'im', 'ames').should.equal("James Alateras");
    text.SUBSTITUTE('Jim Alateras', '', 'ames').should.equal("Jim Alateras");
    text.SUBSTITUTE('Jim Alateras', undefined, 'ames').should.equal("Jim Alateras");
    text.SUBSTITUTE('', 'im', 'ames').should.equal("");
    should.not.exist(text.SUBSTITUTE(undefined, 'im', 'ames'));
    text.SUBSTITUTE('Quarter 1, 2008', '1', '2', 1).should.equal('Quarter 2, 2008');
  });

  test('T', function() {
    text.T('Rainfall').should.equal('Rainfall');
    text.T(19).should.equal('');
    text.T(true).should.equal('');
  });

  test('TEXT', function() {
    text.TEXT.should.throw('TEXT is not implemented');
  });

  test('TRIM', function() {
    text.TRIM(' more  spaces ').should.equal('more spaces');
    text.TRIM(true).should.equal(error.value);
  });

  test('UNICHAR', function() {
    text.UNICHAR(65).should.equal("A");
    text.UNICHAR(255).should.equal("ÿ");
    text.UNICHAR(1000).should.equal(error.value);
  });

  test('UNICODE', function() {
    text.UNICODE('A').should.equal(65);
    text.UNICODE("Ϩ").should.equal(1000);
  });

  test('UPPER', function() {
    text.UPPER('to upper case please').should.equal('TO UPPER CASE PLEASE');
    text.UPPER(true).should.equal(error.value);
  });

  test('VALUE', function() {
    text.VALUE('$1,000').should.equal(1000);
    text.VALUE('16:48:00').should.equal(60480);
    text.VALUE(true).should.equal(error.value);
  });
});
