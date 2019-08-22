function getOwners() {
  var API_KEY = getPropertyValue('HUBSPOT_API_KEY');
  var API_URL = getPropertyValue('HUBSPOT_API_URL');
  
  var url = API_URL + "/owners/v2/owners/" + "?hapikey=" + API_KEY;
  var response = UrlFetchApp.fetch(url);
  var result = JSON.parse(response.getContentText());
  
  var owners = result.map(function(owner) {
    return [owner.ownerId, owner.firstName, owner.email];
  });
  
  return owners;

}

function writeOwners() {
  var owners_ss = sheet('OWNERS_SS_ID');
  owners_ss.getDataRange().clearContent();
  
  var owners = getOwners();

  // Let’s put some headers and add the deals to our table
  var matrix = Array(["Hubspot Owner ID","First Name","Email"]);
  matrix = matrix.concat(owners);
  
  // Writing the table to the spreadsheet
  var range = owners_ss.getRange(1,1,matrix.length,matrix[0].length);
  range.setValues(matrix);
 
  updateTimestamp('owners_data_timestamp');
  addTimestampNoteToData(owners_ss);  
}

function getStages() {
  var API_KEY = getPropertyValue('HUBSPOT_API_KEY');
  var API_URL = getPropertyValue('HUBSPOT_API_URL');
  
  var url = API_URL + "/crm-pipelines/v1/pipelines/deals" + "?hapikey=" + API_KEY;
  
  var response = UrlFetchApp.fetch(url);
  var result = JSON.parse(response.getContentText());
  var stages = Array();
  
  var pipeline_id = "default"; // Enter your pipeline id here
  
  // Looping through the different pipelines you might have in Hubspot
  result.results.forEach(function(item) {
    if (item.pipelineId == pipeline_id) {
      var result_stages = item.stages;
      // Let's sort the stages by displayOrder
      result_stages.sort(function(a,b) {
        return a.displayOrder-b.displayOrder;
      });
  
      // Let's put all the used stages (id & label) in an array
      result_stages.forEach(function(stage) {
        stages.push([stage.stageId,stage.label]);  
      });
    }
  });
  
  return stages;
}

function writeStages() {
  var stages_ss = sheet('STAGES_SS_ID');
  stages_ss.getDataRange().clearContent();
  
  stages_ss.getDataRange().clearContent();
  
  var stages = getStages();
  
  // Let’s put some headers and add the stages to our table
  var matrix = Array(["StageID","Label"]);
  matrix = matrix.concat(stages);
  // Writing the table to the spreadsheet
  var range = stages_ss.getRange(1,1,matrix.length,matrix[0].length);
  range.setValues(matrix);
  
  updateTimestamp('stages_data_timestamp');
  addTimestampNoteToData(stages_ss);
}

function getDeals() {
  var API_KEY = getPropertyValue('HUBSPOT_API_KEY');
  var API_URL = getPropertyValue('HUBSPOT_API_URL');
  
  // Prepare pagination
  // Hubspot lets you take max 250 deals per request.
  // We need to make multiple request until we get all the deals.
  var keep_going = true;
  var offset = 0;
  var deals = Array();
  while(keep_going) {
    // We’ll take five properties from the deals: the source, the stage, the amount & the closed_lost_reason of the deal
    var url = API_URL + "/deals/v1/deal/paged" + "?hapikey=" + API_KEY + "&properties=dealstage&properties=hubspot_owner_id&properties=closedate&properties=amount&properties=closed_lost_reason_&properties=dealname&limit=250&offset="+offset;
    var response = UrlFetchApp.fetch(url);
    var result = JSON.parse(response.getContentText());
    // Are there any more results, should we stop the pagination
    keep_going = result.hasMore;
    offset = result.offset;
    
    var current_year = (new Date()).getYear();
    var current_month = (new Date()).getMonth();
    var next_month_year = addMonths(new Date(), 1).getYear();
    var next_month_month = addMonths(new Date(), 1).getMonth();
    // For each deal, we take the stageId, hubspot_owner_id, closedate, amount & closed_lost_reason
    Logger.log(result.deals[0]);
    result.deals.filter(function(deal) {
      var deal_year = (new Date(parseInt( (deal.properties.hasOwnProperty("closedate")) ? deal.properties.closedate.value : 0))).getYear();
      var deal_month = (new Date(parseInt( (deal.properties.hasOwnProperty("closedate")) ? deal.properties.closedate.value : 0))).getMonth();
      return ((deal_year == current_year && deal_month == current_month) || (deal_year == next_month_year && deal_month == next_month_month)) && deal.properties.hasOwnProperty("dealstage") && deal.properties.hasOwnProperty("hubspot_owner_id") && deal.properties.hasOwnProperty("closedate") && deal.properties.hasOwnProperty("amount");
    }).forEach(function(deal) {
      var stageId = (deal.properties.hasOwnProperty("dealstage")) ? deal.properties.dealstage.value : "unknown";
      var hubspot_owner_id = (deal.properties.hasOwnProperty("hubspot_owner_id")) ? deal.properties.hubspot_owner_id.value : "unknown";
      var closedate = (deal.properties.hasOwnProperty("closedate")) ? (new Date(parseInt(deal.properties.closedate.value))) : "unknown";
      var amount = (deal.properties.hasOwnProperty("amount")) ? deal.properties.amount.value : 0;
      var closed_lost_reason = (deal.properties.hasOwnProperty("closed_lost_reason_")) ? deal.properties.closed_lost_reason_.value : "";
      var dealname = (deal.properties.hasOwnProperty("dealname")) ? deal.properties.dealname.value : "unknown";
      var dealurl = 'https://app.hubspot.com/contacts/3260523/deal/' + deal.dealId;
      deals.push([stageId,hubspot_owner_id,closedate,amount,dealname,dealurl,closed_lost_reason]);
    });
  }
  
  return deals;
}

function writeDeals() {
  var deals_ss = sheet('DEALS_SS_ID');
  deals_ss.getDataRange().clearContent();
  
  deals_ss.getDataRange().clearContent();
  
  var deals = getDeals();
  
  // Let’s put some headers and add the deals to our table
  var matrix = Array(["StageID","Hubspot Owner ID","Close Date","Amount","Deal Name","Deal URL","Close Lost Reason"]);
  matrix = matrix.concat(deals);
  // Writing the table to the spreadsheet
  var range = deals_ss.getRange(1,1,matrix.length,matrix[0].length);
  range.setValues(matrix);
  
  updateTimestamp('deals_data_timestamp');
  addTimestampNoteToData(deals_ss);
}

function getEngagements() {
  var API_KEY = getPropertyValue('HUBSPOT_API_KEY');
  var API_URL = getPropertyValue('HUBSPOT_API_URL');
  
  // Prepare pagination
  // Hubspot lets you take max 250 engagements per request.
  // We need to make multiple request until we get all the engagements.
  var keep_going = true;
  var offset = 0;
  var engagements = Array();
  while(keep_going) {
    // We’ll take three properties from the engagements: the ownerId, the timestamp & the type of the engagement
    var url = API_URL + "/engagements/v1/engagements/paged" + "?hapikey=" + API_KEY + "&properties=ownerId&properties=timestamp&properties=type&limit=250&offset="+offset;
    var response = UrlFetchApp.fetch(url);
    var result = JSON.parse(response.getContentText());
    // Are there any more results, should we stop the pagination
    keep_going = result.hasMore;
    offset = result.offset;

    // For each engagement, we take the ownerId, timestamp and type
    result.results.filter(function(engagement) {
      return (typeof engagement.engagement.ownerId != 'undefined') && (engagement.engagement.type == 'MEETING' || engagement.engagement.type == 'EMAIL' || engagement.engagement.type == 'CALL') && startOfWeek(new Date(parseInt(engagement.engagement.timestamp))) >= addMonths(startOfWeek(new Date()), -1) && new Date(parseInt(engagement.engagement.timestamp)) <= endOfWeek(new Date());
    }).forEach(function(engagement) {
      engagements.push([engagement.engagement.ownerId,new Date(parseInt(engagement.engagement.timestamp)),engagement.engagement.type]);
    });
  }
  
  return engagements;
}

function writeEngagements() {
  var engagements_ss = sheet('ENGAGEMENTS_SS_ID');
  engagements_ss.getDataRange().clearContent();
  
  engagements_ss.getDataRange().clearContent();
  
  var engagements = getEngagements();
  
  // Let’s put some headers and add the engagements to our table
  var matrix = Array(["Owner ID","Timestamp","Type"]);
  matrix = matrix.concat(engagements);
  // Writing the table to the spreadsheet
  var range = engagements_ss.getRange(1,1,matrix.length,matrix[0].length);
  range.setValues(matrix);
  
  updateTimestamp('engagements_data_timestamp');
  addTimestampNoteToData(engagements_ss);
}

function getHubspotData() {
  writeOwners();
  writeStages();
  writeDeals();
  writeEngagements();
}



  