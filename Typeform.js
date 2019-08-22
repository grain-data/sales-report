function getSalespersonFeedback() {
  var API_KEY = getPropertyValue('TYPEFORM_API_KEY');
  var API_URL = getPropertyValue('TYPEFORM_API_URL');
  var feedback_ss = sheet('FEEDBACK_SS_ID');
  
 
  var options = {
    headers: {
      Authorization: 'Bearer ' + API_KEY,
      Accept: 'application/json'
    },
    muteHttpExceptions: true
  }
  var today = new Date();
  var since = new Date(today.getFullYear(), today.getMonth()-6, 1).toISOString();
  var until = today.toISOString();
  var response = UrlFetchApp.fetch(API_URL + 'forms/UUcukz/responses?page_size=1000&completed=true&since=' + since + '&until=' + until, options);
  
  var arr = Array();
  
  JSON.parse(response.getContentText()).items.forEach(function(item1) {
    var answers = item1.answers;
    
    var salesperson_rating = answers.filter(function(answer) {
      return answer.field.ref == '44b2204f-14dd-49a1-9d86-f79cfaaeebf4'
    })[0].number;
    
    var ordering_comment = answers.filter(function(answer) {
      return answer.field.ref == 'bb481a74-6238-4e1a-be52-6dc47259b933'
    })[0].text;
    
    var datetime = item1.hidden.datetime;
    var salesperson = item1.hidden.salesperson;
    
    arr.push([salesperson_rating, ordering_comment, datetime, salesperson]);
  });
  
  feedback_ss.getRange(2, 1, feedback_ss.getLastRow() -1, 4).clearContent();
  feedback_ss.getRange(2, 1, arr.length, 4).setValues(arr);
  updateTimestamp('typeform_refresh_timestamp');
  addTimestampNoteToData(feedback_ss);
}