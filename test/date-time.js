var error = require('../lib/error');
var dateTime = require('../lib/date-time');
var should = require('should');
var index = require('../utils/index');

suite('Date & Time', function () {

  function excelTimestampToDate(excelTimestamp) {
    var localDate = new Date(index.excelToJsTimestamp(excelTimestamp));
    return new Date(localDate.getTime() + localDate.getTimezoneOffset() * 60000);
  }

  should.Assertion.add('beExcelTimestamp', function (year, month, day) {
    var expectedDate = new Date(year, month - 1, day);
    var actualDate = excelTimestampToDate(this.obj);
    this.params = {
      operator: '`' + actualDate + '` to equal date `' + expectedDate + '`'
    };
    this.assert(actualDate.getTime() === expectedDate.getTime());
  });

  should.Assertion.add('beExcelTimestampWithYear', function (expectedYear) {
    var actualDate = excelTimestampToDate(this.obj);
    this.params = {
      operator: '`' + actualDate + '` to have year `' + expectedYear + '`'
    };
    this.assert(actualDate.getFullYear() === expectedYear);
  });

  suite('DATE', function() {
    test('returns excel timestamp for year, month, day', function() {
      dateTime.DATE(2001, 2, 3).should.beExcelTimestamp(2001, 2, 3);
    });
    test('uses year as-is for 1900 to 9999', function() {
      dateTime.DATE(1900, 2, 2).should.beExcelTimestampWithYear(1900);
      dateTime.DATE(9999, 2, 2).should.beExcelTimestampWithYear(9999);
    });
    test('adds 1900 to year for 0 to 1899', function() {
      dateTime.DATE(0, 2, 2).should.beExcelTimestampWithYear(1900);
      dateTime.DATE(1899, 2, 2).should.beExcelTimestampWithYear(3799);
    });
    test('returns num error for year <0 or >9999', function() {
      dateTime.DATE(-1, 2, 2).should.equal(error.num);
      dateTime.DATE(10000, 2, 2).should.equal(error.num);
    });
    test('adds months >12', function() {
      dateTime.DATE(2008, 14, 2).should.beExcelTimestamp(2009, 2, 2);
    });
    test('subtracts months <0', function() {
      dateTime.DATE(2008, -3, 2).should.beExcelTimestamp(2007, 9, 2);
    });
    test('adds days > month has', function() {
      dateTime.DATE(2008, 1, 35).should.beExcelTimestamp(2008, 2, 4);
    });
    test('subtracts days <0', function() {
      dateTime.DATE(2008, 1, -15).should.beExcelTimestamp(2007, 12, 16);
    });
    test('returns value error for string year', function() {
      dateTime.DATE('x', 1, 1).should.equal(error.value);
    });
    test('returns value error for string month', function() {
      dateTime.DATE(2000, 'x', 1).should.equal(error.value);
    });
    test('returns value error for string day', function() {
      dateTime.DATE(2000, 1, 'invalid').should.equal(error.value);
    });
  });

  suite('DATEVALUE', function () {
    test('parses dates between 1-jan-1900 and 31-dec-9999', function () {
      dateTime.DATEVALUE('1/2/2000').should.beExcelTimestamp(2000, 1, 2);
      dateTime.DATEVALUE('1/2/2100').should.beExcelTimestamp(2100, 1, 2);
      dateTime.DATEVALUE('1/2/1970').should.beExcelTimestamp(1970, 1, 2);
      dateTime.DATEVALUE('1/1/1900').should.beExcelTimestamp(1900, 1, 1);
      dateTime.DATEVALUE('12/31/9999').should.beExcelTimestamp(9999, 12, 31);
    });
    test('parses supported formats', function () {
      dateTime.DATEVALUE('2-jan-2000').should.beExcelTimestamp(2000, 1, 2);
      dateTime.DATEVALUE('2-JAN-2000').should.beExcelTimestamp(2000, 1, 2);
      dateTime.DATEVALUE('january 2, 2000').should.beExcelTimestamp(2000, 1, 2);
      dateTime.DATEVALUE('JANUARY 2, 2000').should.beExcelTimestamp(2000, 1, 2);
      dateTime.DATEVALUE('2000-1-2').should.beExcelTimestamp(2000, 1, 2);
      dateTime.DATEVALUE('2000/1/2').should.beExcelTimestamp(2000, 1, 2);
    });
    test('ignores time part of date-time', function () {
      //TODO: dateTime.DATEVALUE('1/2/2000 15:00').should.beExcelTimestamp(2000, 1, 2);
    });
    test('returns 0 for time only string', function () {
      //TODO: dateTime.DATEVALUE('15:00').should.equal(0);
    });
    // TODO: How to use the current year when no year is specified?  Date.parse() seems to use 
    // 2001 when no year is specified (is that standard?), so could that and change the year if 
    // it's 2001, but that fails when the input actually specifies 2001.  Could _only_ change the
    // year if the input does _not_ contain the text '2001', but that fails  when the input 
    // specifies the year as 2 digits (1/1/01) or just 1 digit (1/1/1).  Trying to parse 
    // the year from the input is non-trivial since it can either be the last or the first part.  
    // I guess as the first part it almost surely needs to be 4 digits, but as last it can be 1, 
    // 2, 3(?) or 4.  And, the parts can be delimited with a variety of chars -- slash, dash and 
    // space (are there more?).  Basically, parsing the date would be mostly custom rather than
    // using Date.
    test('uses current year when not specified', function () {
      //dateTime.DATEVALUE('1/5').should.beExcelTimestamp(new Date().getFullYear(), 1, 5);
      //dateTime.DATEVALUE('5-jan').should.beExcelTimestamp(new Date().getFullYear(), 1, 5);
    });
    test('expands 2-digit year as 19xx for year >=30', function () {
      //NOTE: Excel 2013 uses 30 as the cutoff for 19xx/20xx, but this (via new Date()) seems to 
      // use 50.  Older Excel versions used 20 instead of 30, and future versions (in 10 to 20 
      // years!), will surely push the changeover higher.  So, it would be good if this used
      // 30, but I think it would be hard to implement so maybe 50 is good enough.
      //dateTime.DATEVALUE('1/1/30').should.beExcelTimestampWithYear(1930);
      dateTime.DATEVALUE('1/1/50').should.beExcelTimestampWithYear(1950);
      dateTime.DATEVALUE('1/1/99').should.beExcelTimestampWithYear(1999);
    });
    test('expands 2-digit year as 20xx for year <30', function () {
      dateTime.DATEVALUE('1/1/01').should.beExcelTimestampWithYear(2001);
      dateTime.DATEVALUE('1/1/29').should.beExcelTimestampWithYear(2029);
    });
    test('expands 1-digit year as 200x', function () {
      dateTime.DATEVALUE('1/1/1').should.beExcelTimestampWithYear(2001);
      dateTime.DATEVALUE('1/1/9').should.beExcelTimestampWithYear(2009);
    });
    test('returns value error for date before 1900', function () {
      dateTime.DATEVALUE('12/31/1899').should.equal(error.value);
      dateTime.DATEVALUE('1/1/1492').should.equal(error.value);
    });
    test('returns value error for invalid date text', function () {
      dateTime.DATEVALUE('0/0/0').should.equal(error.value);
    });
    test('returns value error for non-text', function () {
      dateTime.DATEVALUE(1).should.equal(error.value);
    });
  });

  suite('DAY', function() {
    test('returns 1 for excel timestamp 1-jan-1900', function() {
      dateTime.DAY(1).should.equal(1);
    });
    test('returns 31 for excel timestamp 31-dec-9999', function () {
      dateTime.DAY(2958465).should.equal(31);
    });
    test('converts text number to excel timestamp', function () {
      dateTime.DAY('1').should.equal(1);
    });
    test('returns day of text date', function () {
      dateTime.DAY('1/1/1900').should.equal(1);
    });
    test('returns day of Date', function () {
      dateTime.DAY(new Date(1900, 0, 1)).should.equal(1);
    });
    test('returns num error for negative number', function () {
      dateTime.DAY(-1).should.equal(error.num);
    });
    test('returns value error for invalid text', function () {
      dateTime.DAY('a').should.equal(error.value);
    });
  });

  suite('DAYS', function() {
    test('returns delta between excel timestamps', function () {
      dateTime.DAYS(2, 1).should.equal(1);
      dateTime.DAYS(1, 2).should.equal(-1);
    });
    test('returns day delta between text dates', function () {
      dateTime.DAYS('1/2/1900', '1/1/1900').should.equal(1);
      dateTime.DAYS('1/1/2001', '1/1/2000').should.equal(366);
    });
    test('returns day delta between Date objects', function () {
      dateTime.DAYS(new Date(1900, 1, 2), new Date(1900, 1, 1)).should.equal(1);
    });
    test('returns value error for invalid arg', function () {
      dateTime.DAYS('a', 1).should.equal(error.value);
      dateTime.DAYS(1, 'a').should.equal(error.value);
    });
  });

  suite('DAYS360', function () {
    suite('US method', function () {
      test('returns delta between excel timestamps', function () {
        dateTime.DAYS360(1, 2).should.equal(1);
        dateTime.DAYS360(2, 1).should.equal(-1);
      });
      test('returns actual day delta for dates in same month', function () {
        dateTime.DAYS360('1/2/2000', '1/10/2000').should.equal(8);
        dateTime.DAYS360('1/1/2000', '1/31/2000').should.equal(30);
      });
      test('returns 30 for 1st of month to 1st of next month', function () {
        dateTime.DAYS360('1/1/2000', '2/1/2000').should.equal(30);
      });
      test('returns 360 for 1-jan to 31-dec of same year', function () {
        dateTime.DAYS360('1/1/2000', '12/31/2000').should.equal(360);
      });
      test('returns 360 for 1-jan to 1-jan of next year', function () {
        dateTime.DAYS360('1/1/2000', '1/1/2001').should.equal(360);
      });
    });
    suite('European method', function() {
      test('returns delta between excel timestamps', function () {
        dateTime.DAYS360(1, 2, true).should.equal(1);
        dateTime.DAYS360(2, 1, true).should.equal(-1);
      });
      test('returns actual day delta for dates in same month', function () {
        dateTime.DAYS360('1/2/2000', '1/10/2000', true).should.equal(8);
      });
      test('returns 29 for 1-jan to 31-jan', function () {
        dateTime.DAYS360('1/1/2000', '1/31/2000', true).should.equal(29);
      });
      test('return 30 for 1st of month to 1st of next month', function () {
        dateTime.DAYS360('1/1/2000', '2/1/2000', true).should.equal(30);
      });
      test('returns 359 for 1-jan to 31-dec of same year', function () {
        dateTime.DAYS360('1/1/2000', '12/31/2000', true).should.equal(359);
      });
      test('returns 360 for 1-jan to 1-jan of next year', function () {
        dateTime.DAYS360('1/1/2000', '1/1/2001', true).should.equal(360);
      });
    });
    test('returns value error for invalid arg', function () {
      dateTime.DAYS360('1/1/2000', 'a').should.equal(error.value);
      dateTime.DAYS360('a', '1/2/2000').should.equal(error.value);
      dateTime.DAYS360('1/1/2000', '1/2/2000', 'a').should.equal(error.value);
    });
  });

  suite('EDATE', function() {
    test('returns input date plus number of months', function () {
      dateTime.EDATE('1/1/2000', 0).should.beExcelTimestamp(2000, 1, 1);
      dateTime.EDATE('1/1/2000', 13).should.beExcelTimestamp(2001, 2, 1);
      dateTime.EDATE('1/1/2000', -3).should.beExcelTimestamp(1999, 10, 1);
    });
    test('returns value error for invalid arg', function () {
      dateTime.EDATE('a', 0).should.equal(error.value);
      dateTime.EDATE('1/1/2000', 'a').should.equal(error.value);
    });
  });

  suite('EOMONTH', function () {
    test('returns last day of month specified from start date and month delta', function () {
      dateTime.EOMONTH('1/1/2000', 0).should.beExcelTimestamp(2000, 1, 31);
      dateTime.EOMONTH('1/1/2000', 1).should.beExcelTimestamp(2000, 2, 29);
      dateTime.EOMONTH('1/1/2000', 12).should.beExcelTimestamp(2001, 1, 31);
    });
    test('returns value error for invalid arg', function () {
      dateTime.EOMONTH('a', 0).should.equal(error.value);
      dateTime.EOMONTH('1/1/2000', 'a').should.equal(error.value);
    });
  });

  suite('HOUR', function() {
    test('returns hour of day of excel timestamp', function () {
      dateTime.HOUR(123.75).should.equal(18);
    });
    test('returns hour of day of excel timestamp string', function () {
      dateTime.HOUR('0.25').should.equal(6);
    });
    test('returns 0 for date only string', function () {
      dateTime.HOUR('1/1/2000').should.equal(0);
    });
    test('returns hour of day for date/time string', function () {
      dateTime.HOUR('1/1/2000 1:23').should.equal(1);
    });
    test('returns hour for time only string', function () {
      //TODO: dateTime.HOUR('1:00').should.equal(1);
    });
    test('returns value error for invalid arg', function () {
      dateTime.HOUR('a').should.equal(error.value);
    });
  });

  test('ISOWEEKNUM', function() {
    dateTime.ISOWEEKNUM('1/1/1901').should.equal(1);
    dateTime.ISOWEEKNUM('1/8/1901').should.equal(2);
    dateTime.ISOWEEKNUM('12/29/1901').should.equal(52);
    dateTime.ISOWEEKNUM('6/6/1902').should.equal(23);
    dateTime.ISOWEEKNUM('a').should.equal(error.value);
  });

  test('MINUTE', function() {
    dateTime.MINUTE('1/1/1901').should.equal(0);
    dateTime.MINUTE('1/1/1901 1:01').should.equal(1);
    // dateTime.MINUTE('1:01').should.equal(1);
    dateTime.MINUTE('a').should.equal(error.value);
  });

  test('MONTH', function() {
    dateTime.MONTH('1/1/1900').should.equal(1);
    dateTime.MONTH('12/1/1900').should.equal(12);
    dateTime.MONTH('a').should.equal(error.value);
  });

  test('NETWORKDAYS', function() {
    dateTime.NETWORKDAYS('1/1/1900', '1/2/1900').should.equal(2);
    dateTime.NETWORKDAYS('1/1/1900', '2/1/1900').should.equal(24);
    dateTime.NETWORKDAYS('1/1/1900', '2/1/1900', '1/2/1900').should.equal(23);
    dateTime.NETWORKDAYS('1/1/1900', '2/1/1900', ['1/2/1900', '1/3/1900']).should.equal(22);
    dateTime.NETWORKDAYS('a', '1/2/1900').should.equal(error.value);
    dateTime.NETWORKDAYS('1/1/1900', 'a').should.equal(error.value);
    dateTime.NETWORKDAYS('1/1/1900', '2/1/1900', 'a').should.equal(error.value);
  });

  test('NETWORKDAYS.INTL', function() {
    dateTime.NETWORKDAYS.INTL('1/1/1900', '1/2/1900').should.equal(2);
    dateTime.NETWORKDAYS.INTL('1/1/1900', '1/2/1900', 2).should.equal(1);
    dateTime.NETWORKDAYS.INTL('1/1/1900', '1/2/1900', -1).should.equal(error.value);
  });

  test('NOW', function() {
    // dateTime.NOW().should.instanceof(Date);
  });

  test('SECOND', function() {
    dateTime.SECOND('1/1/1900').should.equal(0);
    dateTime.SECOND('1/1/1900 1:00:01').should.equal(1);
    dateTime.SECOND('a').should.equal(error.value);
  });

  test('TIME', function() {
    dateTime.TIME(0, 0, 0).should.equal(0);
    dateTime.TIME(1, 1, 1).should.approximately(0.04237268518518519, 1e-9);
    dateTime.TIME(-1, -1, -1).should.equal(error.num);
    dateTime.TIME('invalid').should.equal(error.value);
  });

  test('TIMEVALUE', function() {
    dateTime.TIMEVALUE('1/1/1900 00:00:00').should.equal(0);
    dateTime.TIMEVALUE('1/1/1900 12:00:00').should.approximately(0.5, 1e-9);
    dateTime.TIMEVALUE('a').should.equal(error.value);
  });

  test('TODAY', function() {
    // dateTime.TODAY().should.instanceof(Date);
  });

  test('WEEKDAY', function() {
    dateTime.WEEKDAY('1/1/1901').should.equal(3);
    dateTime.WEEKDAY('1/1/1901', 2).should.equal(2);
    dateTime.WEEKDAY('a').should.equal(error.value);
  });

  test('WEEKNUM', function() {
    dateTime.WEEKNUM('1/1/1900').should.equal(1);
    dateTime.WEEKNUM('2/1/1900').should.equal(5);
    dateTime.WEEKNUM('2/1/1909', 2).should.equal(6);
    dateTime.WEEKNUM('1/1/1901', 21).should.equal(1);
    dateTime.WEEKNUM('a').should.equal(error.value);
  });

  test('WORKDAY', function() {
    dateTime.WORKDAY('1/1/1900', 1).should.equal(2);
    dateTime.WORKDAY('1/1/1900', 7).should.equal(10);
    dateTime.WORKDAY('1/1/1900', 2, '1/2/1900').should.equal(4);
    dateTime.WORKDAY('a', 1, '1/2/1900').should.equal(error.value);
    dateTime.WORKDAY('1/1/1900', 'a').should.equal(error.value);
    dateTime.WORKDAY('1/1/1900', 1, 'a').should.equal(error.value);
    dateTime.WORKDAY('1/1/2016', -1).should.beExcelTimestamp(2015, 12, 31);
  });

  test('WORKDAY.INTL', function() {
    dateTime.WORKDAY.INTL('1/1/1900', 1).should.equal(2);
    dateTime.WORKDAY.INTL('1/1/1905', 1, 2).should.equal(1830);
    dateTime.WORKDAY.INTL('1/1/1900', 1, 'a').should.equal(error.value);
  });

  test('YEAR', function() {
    dateTime.YEAR('1/1/1900').should.equal(1900);
    dateTime.YEAR('a').should.equal(error.value);
  });

  test('YEARFRAC', function() {
    dateTime.YEARFRAC('1/1/1900', '1/2/1900').should.approximately(0.002777777777777778, 1e-3);
    dateTime.YEARFRAC('1/31/1900', '3/31/1900', 0).should.approximately(0.16666666666666666, 1e-3);
    dateTime.YEARFRAC('1/31/1900', '2/1/1900', 0).should.approximately(0.002777777777777778, 1e-3);
    dateTime.YEARFRAC('1/30/1900', '3/31/1900', 0).should.approximately(0.16666666666666666, 1e-3);

    dateTime.YEARFRAC('1/1/1900', '1/2/1900', 1).should.approximately(0.0027397260273972603, 1e-3);
    dateTime.YEARFRAC('1/1/1904', '1/1/1905', 1).should.equal(1);
    dateTime.YEARFRAC('5/1/1903', '5/1/1904', 1).should.equal(1);
    dateTime.YEARFRAC('1/1/1903', '5/1/1904', 1).should.approximately(1.3295713634290924, 1e-3);
    dateTime.YEARFRAC('1/1/1904', '1/2/1904', 1).should.approximately(0.00273224043715847, 1e-3);

    dateTime.YEARFRAC('1/1/1900', '1/2/1900', 2).should.approximately(0.002777777777777778, 1e-3);
    dateTime.YEARFRAC('1/1/1900', '1/2/1900', 3).should.approximately(0.0027397260273972603, 1e-3);
    dateTime.YEARFRAC('1/1/1900', '1/2/1900', 4).should.approximately(0.002777777777777778, 1e-3);
    dateTime.YEARFRAC('a', '1/2/1900').should.equal(error.value);
    dateTime.YEARFRAC('1/1/1900', 'a').should.equal(error.value);
  });
});
