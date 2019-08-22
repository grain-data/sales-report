function getFrontStats() {
  var API_KEY = getPropertyValue('FRONT_API_KEY');
  var API_URL = getPropertyValue('FRONT_API_URL');
  var front_ss = sheet('FRONT_SS_ID');
  
  
  var options = {
    headers: {
      Authorization: 'Bearer ' + API_KEY,
      Accept: 'application/json'
    },
    muteHttpExceptions: true
  }
  
  function getTeammateEmailByName(name) {
    var teammates = JSON.parse(UrlFetchApp.fetch(API_URL + 'teammates', options).getContentText());
    var email_arr = teammates._results.filter(function(teammate) {
      return teammate.first_name + " " + teammate.last_name == name
    });
    
    var email = email_arr.length > 0 ? email_arr[0].email : "";
    Logger.log(email);
    return email;
  }
  
  var d = new Date();
  //This week to date
  var start_of_week = Math.floor((startOfWeek(d)/1000)).toString();
  var today = Math.floor(d.setHours(23,59,59,59)/1000).toString();
  Logger.log('start=' + start_of_week + '&end=' + today);

  var metrics = JSON.parse(UrlFetchApp.fetch(API_URL + 'analytics?metrics[]=team_table&start=' + start_of_week + '&end=' + today, options).getContentText());
  Logger.log(metrics);
  while (metrics.metrics.length < 1) {
    var metrics = JSON.parse(UrlFetchApp.fetch(API_URL + 'analytics?metrics[]=team_table&start=' + start_of_week + '&end=' + today, options).getContentText());
  }
  Logger.log(metrics);
  var columns = metrics.metrics[0].columns.map(function(column) {
    return column.label
  });
  
  var table = metrics.metrics[0].rows.map(function(row) {
    return row.map(function(cell) {
      if (cell.t == 'teammate') {
        var result = getTeammateEmailByName(cell.v)
      } else {
        var result = cell.v
      }
      return result
    })
  });
  
  //Last week to same day last week
  d.setDate(d.getDate()-7);
  var start_of_week_prev = Math.floor((startOfWeek(d)/1000)).toString();
  var today_prev = Math.floor(d.setHours(23,59,59,59)/1000).toString();
  Logger.log('start=' + start_of_week_prev + '&end=' + today_prev);

  var metrics_prev = JSON.parse(UrlFetchApp.fetch(API_URL + 'analytics?metrics[]=team_table&start=' + start_of_week_prev + '&end=' + today_prev, options).getContentText());
  while (metrics_prev.metrics == []) {
    var metrics_prev = JSON.parse(UrlFetchApp.fetch(API_URL + 'analytics?metrics[]=team_table&start=' + start_of_week + '&end=' + today, options).getContentText());
  }
  Logger.log(metrics_prev);
  var columns_prev = metrics_prev.metrics[0].columns.map(function(column) {
    return column.label
  });
  
  var table_prev = metrics_prev.metrics[0].rows.map(function(row) {
    return row.map(function(cell) {
      if (cell.t == 'teammate') {
        var result = getTeammateEmailByName(cell.v)
      } else {
        var result = cell.v
      }
      return result
    })
  });
  
  
  table.unshift(columns);
  table_prev.unshift(columns);
  
  front_ss.getDataRange().clearContent();
  front_ss.getRange(1,1, table.length, columns.length).setValues(table);
  front_ss.getRange(1,11, table_prev.length, columns.length).setValues(table_prev);

  updateTimestamp('front_data_timestamp');
  addTimestampNoteToData(front_ss);
}