var token = "your bot token goes here"; 
var telegramUrl = "https://api.telegram.org/bot" + token;

const DEFAULT_INTRO_TEXT = "Перешлите сообщение от канала (или группы) и бот ответит, находится ли он в списке.\nОбратите внимание, что сообщение может быть в канале за авторством кого-то из пользователей, в таком случае бот вернет ошибку, так как в пересланном сообщении не будет содержаться информация о канале, из которого оно было переслано."
const DEFAULT_ENTRY_FOUND_TEXT = "\nКанал/группа находится в списке!"
const DEFAULT_ENTRY_NOT_FOUND_TEXT = "\nКанал/группа не находится в списке."

// default texts will be replaced by corresponding values from configuration if set
var introText = DEFAULT_INTRO_TEXT
var entryFoundText = DEFAULT_ENTRY_FOUND_TEXT
var entryNotFoundText = DEFAULT_ENTRY_NOT_FOUND_TEXT;

// some initialization code goes here
(function() {
  var configSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Configuration")
  var configData = configSheet.getDataRange().getValues()

  for(var i = 0; i < configData.length; i++) {
      if (configData[i][0] == "INTRO_TEXT" && configData[i][0] != "") {
        introText = configData[i][1];
        break
      }
  }    
  for(var i = 0; i < configData.length; i++) {
      if (configData[i][0] == "ENTRY_FOUND_TEXT" && configData[i][0] != "") {
        entryFoundText = configData[i][1];
        break
      }
  }    
  for(var i = 0; i < configData.length; i++) {
      if (configData[i][0] == "ENTRY_NOT_FOUND_TEXT" && configData[i][0] != "") {
        entryNotFoundText = configData[i][1];
        break
      }
  }
})()

function sendMessage(chat_id, text) {
  var url = telegramUrl + "/sendMessage?chat_id=" + chat_id + "&text="+ encodeURIComponent(text);
  var response = UrlFetchApp.fetch(url);
  Logger.log(response.getContentText()); 
}

function flatten(arrayOfArrays) {
  return [].concat.apply([], arrayOfArrays);
}

function doPost(e) {
  // Logger.log(e.postData.contents);
  var contents = JSON.parse(e.postData.contents);
  var idsSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Ids")
  
  var ids = flatten(idsSheet.getDataRange().getValues())
  // Logger.log(ids);

  var chat_id = contents.message.from.id;
  var text = introText;
  var forward_from_chat = contents.message.forward_from_chat;
  var forward_from = contents.message.forward_from;
  var forward_sender_name = contents.message.forward_sender_name;
  // Logger.log("forward_from_chat id = " + forward_from_chat.id);
  if (forward_from_chat) {
    text = "Переслано сообщение от \n";
    text += JSON.stringify(forward_from_chat);
    if (ids.includes(forward_from_chat.id)) {
      text += "\n" + entryFoundText
    } else {
      text += "\n" + entryNotFoundText
    }
  } else if (forward_from) {
    text = "Переслано сообщение от обычного пользователя:\n"
    text += JSON.stringify(forward_from);
    text += "\nБот проверяет только каналы и группы на нахождение в списке."
  } else if (forward_sender_name) {
    // forward_sender_name is filled instead of forward_from block when user hid their details
    text = "Переслано сообщение от обычного пользователя:\n"
    text += JSON.stringify(forward_sender_name);
    text += "\nБот проверяет только каналы и группы на нахождение в списке."
  }

  // Logger.log(text);

  sendMessage(chat_id,text)
}
