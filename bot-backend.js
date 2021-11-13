var token = "token goes here"; 
var telegramUrl = "https://api.telegram.org/bot" + token; 
var dataSheetName = "Channel Ids"

function sendMessage(chat_id, text) {
  var url = telegramUrl + "/sendMessage?chat_id=" + chat_id + "&text="+ encodeURIComponent(text);
  var response = UrlFetchApp.fetch(url);
  Logger.log(response.getContentText()); 
}

function flatten(arrayOfArrays) {
  return [].concat.apply([], arrayOfArrays);
}

function doPost(e) {
  var contents = JSON.parse(e.postData.contents);
  var idsSheet =  SpreadsheetApp.getActiveSpreadsheet().getSheetByName(dataSheetName)

  // 1st row is a header row
  // make sure count of rows is updated if there will be more data aded to the spreadsheet
  // todo: detect last filled row programmatically and remove magic number 300
  // var ids = flatten(idsSheet.getRange(2, 1, 300).getValues());
  // Logger.log(ids);

  var chat_id = contents.message.from.id;
  
  // add logic here
  var text = "Message received.\n";
  
  // Logger.log(text);

  sendMessage(chat_id,text)
}
