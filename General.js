//Spreadsheets
function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu("Refresh data")
//  .addItem("📧Front", 'getFrontStats')
  .addItem("🔥Hubspot", 'getHubspotData')
  .addItem("💁Catering feedback", 'getSalespersonFeedback')
  .addToUi();
}

function doPost(e) {
  var octopus_ss = sheet('OCTOPUS_SS_ID');
  if (typeof e !== 'undefined') {
    if(e.parameter.type == 'customer_info') {
      var keys = getKeys();
      var values = keys.map(function(key) {
        return [e.parameter[key]];
      });
      octopus_ss.getRange(9, 3, 10, 1).setFontColor("black");
      octopus_ss.getRange(9, 3, 10, 1).setValues(values);
      octopus_ss.getRange(9, 2, 10, 2).setBorder(true, true, true, true, true, true, '#efefef', null);
    }
    else if(e.parameter.type == 'meal_info') {
      var arr = e.parameter.meals.replace(/\'/g,"").slice(1,-1).split(",").map(function(item) {
        return item.trim().split(":");
      });
      
      Logger.log(arr);
      octopus_ss.getRange(9, 6, arr.length, 1).setFontColor("#f6703e");
      octopus_ss.getRange(9, 5, arr.length, 3).setValues(arr);
      octopus_ss.getRange(9, 5, arr.length, 3).setBorder(true, true, true, true, true, true, '#efefef', null);
    }
    else if(e.parameter.type == 'sales_data_update') {
      updateTimestamp('sales_refresh_timestamp');
    }
  }
}

function updateTimestamp(named_range_prefix) {
  var date_string = formatDateTime(new Date(), "d MMM yyyy h:mm a");
  var timestamp = ("Last refreshed on " + date_string );
  var named_ranges = SpreadsheetApp.getActiveSpreadsheet().getNamedRanges();
  named_ranges.forEach(function(range) {
    if (range.getName().indexOf(named_range_prefix) != -1) {
      range.getRange().setValue(timestamp)
    }
  });
  
  return true;
}

function addTimestampNoteToData(sheet) {
  var date_string = formatDateTime(new Date(), "d MMM yyyy h:mm a");
  var timestamp = ("Last refreshed on " + date_string );
  sheet.getRange("A1").setNote(timestamp);
}

function clearContent(sheet_property_key, row, column, num_rows, num_columns) {
  sheet(sheet_property_key).getRange(row, column, num_rows, num_columns).clearContent();
}

function setProperty(key, value) {
  PropertiesService.getScriptProperties().setProperty(key, value);
}

function getPropertyKeys() {
  var keys = PropertiesService.getScriptProperties().getKeys();
  Logger.log(keys);
  return keys;
}

function getPropertyValue(key) {
  var value = PropertiesService.getScriptProperties().getProperty(key);
  return value;
}  

function sheet(sheet_property_name) {
  var ss =  getSheetById(parseInt(getPropertyValue(sheet_property_name)));
  return ss;
}

function getSheetById(id) {
  return SpreadsheetApp.getActive().getSheets().filter(
    function(s) {return s.getSheetId() === id;}
  )[0];
}
  

function formatDateTime(date, format) {
  var date_string = Utilities.formatDate(date, Session.getScriptTimeZone(), format);
  Logger.log(date_string);
  return date_string;
  /*
  G	Era designator	Text	AD
  y	Year	Year	1996; 96
  Y	Week year	Year	2009; 09
  M	Month in year	Month	July; Jul; 07
  w	Week in year	Number	27
  W	Week in month	Number	2
  D	Day in year	Number	189
  d	Day in month	Number	10
  F	Day of week in month	Number	2
  E	Day name in week	Text	Tuesday; Tue
  u	Day number of week (1 = Monday, ..., 7 = Sunday)	Number	1
  a	Am/pm marker	Text	PM
  H	Hour in day (0-23)	Number	0
  k	Hour in day (1-24)	Number	24
  K	Hour in am/pm (0-11)	Number	0
  h	Hour in am/pm (1-12)	Number	12
  m	Minute in hour	Number	30
  s	Second in minute	Number	55
  S	Millisecond	Number	978
  z	Time zone	General time zone	Pacific Standard Time; PST; GMT-08:00
  Z	Time zone	RFC 822 time zone	-0800
  X	Time zone	ISO 8601 time zone	-08; -0800; -08:00
  */
  
}

function addMonths(date, months) {
  var d = date.getDate();
  date.setMonth(date.getMonth() + +months);
  if (date.getDate() != d) {
    date.setDate(0);
  }
  return date;
}

function startOfWeek(date) {
  var diff = date.getDate() - date.getDay() + (date.getDay() === 0 ? -6 : 1);
  var d = new Date(date.setDate(diff));
  d.setHours(0,0,0,0);
  return d;
}

function endOfWeek(date) {
  var diff = date.getDate() - date.getDay() + (date.getDay() === 0 ? -6 : 1);
  var d = new Date(date.setDate(diff + 6));
  d.setHours(23,59,59,59);
  return d;
}


function nsjdkfn() {
  Logger.log('Hello');
  
}

