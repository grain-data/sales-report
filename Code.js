// Use this code for Google Docs, Slides, Forms, or Sheets.
function onOpen() {
  SpreadsheetApp.getUi() // Or DocumentApp or SlidesApp or FormApp.
      .createMenu('Dialog')
      .addItem('Open', 'openDialog')
      .addToUi();
}

function openDialog() {
  var html = HtmlService
      .createTemplateFromFile('index')
      .evaluate();
  SpreadsheetApp.getUi() // Or DocumentApp or SlidesApp or FormApp.
      .showModalDialog(html, 'Hello World');
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename)
      .getContent();
}

function now() {
  var date_string = formatDateTime(new Date(), "d MMM yyyy h:mm a");
  return date_string;
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