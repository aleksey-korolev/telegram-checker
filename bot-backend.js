var token = "2136035455:AAGLWxJ-JUAAImnVob6r_e3r2gLa2Ky80BE"; 
var telegramUrl = "https://api.telegram.org/bot" + token;
var webAppUrl = "https://script.google.com/macros/s/AKfycbysoxac-J5MI1F_AtgYvYTewtQwI9qWAkucwzhhVRZgZQBgaBQB1VnlwGOGVIVNzoQh/exec";
var spreadSheetId = "14HyHeY_ymA0Dqx16wXdgYHDE4_Pe2W7OASZwFSK0qDs";

const DEFAULT_INTRO_TEXT = "Перешлите сообщение от канала (или группы) и бот ответит, находится ли он в списке.\nОбратите внимание, что сообщение может быть в канале за авторством кого-то из пользователей, в таком случае бот вернет ошибку, так как в пересланном сообщении не будет содержаться информация о канале, из которого оно было переслано.";
const DEFAULT_ENTRY_FOUND_TEXT = "\nКанал/группа находится в списке!";
const DEFAULT_ENTRY_NOT_FOUND_TEXT = "\nКанал/группа не находится в списке.";

// default texts will be replaced by corresponding values from configuration if set
var introText = DEFAULT_INTRO_TEXT;
var entryFoundText = DEFAULT_ENTRY_FOUND_TEXT;
var entryNotFoundText = DEFAULT_ENTRY_NOT_FOUND_TEXT;

var KEYBOARD_INLINE_REMOVE = {
  "inline_keyboard": [
              [{
                "text": "убрать из списка",
                "callback_data": "remove_the_channel"         
              }]
            ]
};

var KEYBOARD_INLINE_ADD = {
  "inline_keyboard": [
              [{
                "text": "добавить в список",
                "callback_data": "add_the_channel"
                  
              }]
            ]
};

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

function setWebhook() {
  var url = telegramUrl + "/setWebhook?url=" + webAppUrl;
  UrlFetchApp.fetch(url);
}

function sendMessage(chat_id, text, keyboard, id_msg) { // Отправляет сообщение используя sendMessage
  var data = {
    method: "sendMessage",
    chat_id: String(chat_id),
    text: text,
    parse_mode: "HTML",
    reply_markup: JSON.stringify(keyboard),
    reply_to_message_id: String(id_msg)
  };
  var options = {
    method: 'POST',
    payload: data,
    muteHttpExceptions: true
  };
  var response = UrlFetchApp.fetch('https://api.telegram.org/bot' + token + '/', options);
  // Logger.log(response.getContentText());
}

function getChat(chat_id) {
  var url = telegramUrl + "/getChat?chat_id=" + chat_id;
  var response = UrlFetchApp.fetch(url);
  return JSON.parse(response.getContentText());
}

function flatten(arrayOfArrays) {
  return [].concat.apply([], arrayOfArrays);
}

function doPost(e) {
  // Logger.log(e.postData.contents);
  var contents = JSON.parse(e.postData.contents);
  var idsSheet = SpreadsheetApp.openById(spreadSheetId).getSheetByName("Ids");
  var suggestionsSheet = SpreadsheetApp.openById(spreadSheetId).getSheetByName("Suggestions");
  var ids = flatten(idsSheet.getDataRange().getValues());
  var suggestions = flatten(suggestionsSheet.getDataRange().getValues());
  // Logger.log(ids);

  if (contents.callback_query) { //keyboards handler
    var data = contents.callback_query.data;
    var chat_id = contents.callback_query.from.id;
    var username = "@" + contents.callback_query.from.username;
    var channel_id = null;
    var messageText = contents.callback_query.message.text;

    if (messageText.startsWith("Id канала:")) {
      channel_id = messageText.split("\n")[1];
    } else if(messageText.startsWith("Переслано сообщение от")) {
      channel_id = JSON.parse(messageText.split("\n")[1]).id;
    }

    var query_id = suggestions.length/6;
    var sheetStringNumber = suggestions.length/6 + 1;
    var channel_username = "https://t.me/" + getChat(channel_id).result.username;

    suggestionsSheet.getRange("A" + sheetStringNumber).setValue(query_id);
    suggestionsSheet.getRange("B" + sheetStringNumber).setValue(username);
    suggestionsSheet.getRange("C" + sheetStringNumber).setValue(channel_id);
    suggestionsSheet.getRange("D" + sheetStringNumber).setValue(channel_username);

    if (data == "remove_the_channel") {
      suggestionsSheet.getRange("E" + sheetStringNumber).setValue("remove");
      sendMessage(chat_id,"This channel will be removed!");
    }

    if (data == "add_the_channel") {
      suggestionsSheet.getRange("E" + sheetStringNumber).setValue("add");
      sendMessage(chat_id,"This channel will be added!");
    }
  } 

  if (contents.message) {
      var chat_id = contents.message.from.id;
      var text = introText;
      var forward_from_chat = contents.message.forward_from_chat;
      var forward_from = contents.message.forward_from;
      var forward_sender_name = contents.message.forward_sender_name;
      var entities = contents.message.entities;
      var keyboard = null;

      // Logger.log("forward_from_chat id = " + forward_from_chat.id);

      if (forward_from_chat) {
        text = "Переслано сообщение от\n";
        text += JSON.stringify(forward_from_chat);
        if (ids.includes(forward_from_chat.id)) {
          text += "\n" + entryFoundText;
          keyboard = KEYBOARD_INLINE_REMOVE;
        } else {
          text += "\n" + entryNotFoundText;
          keyboard = KEYBOARD_INLINE_ADD;
        }
        sendMessage(chat_id,text,keyboard);
      } else if (forward_from) {
        text = "Переслано сообщение от обычного пользователя:\n"
        text += JSON.stringify(forward_from);
        text += "\nБот проверяет только каналы и группы на нахождение в списке."
        sendMessage(chat_id,text);
      } else if (forward_sender_name) {
        // forward_sender_name is filled instead of forward_from block when user hid their details
        text = "Переслано сообщение от обычного пользователя:\n"
        text += JSON.stringify(forward_sender_name);
        text += "\nБот проверяет только каналы и группы на нахождение в списке."
        sendMessage(chat_id,text);
      } else if (entities) {
        if (contents.message.text.substring(13, 21) == "joinchat") {
          var hash = contents.message.text.substring(22);
          text = "Id канала:\n";
          text += JSON.stringify(contents);
        } else {
          var channel_id = getChat("@" + contents.message.text.substring(13)).result.id;
          text = "Id канала:\n";
          text += JSON.stringify(channel_id);
        }
        if (ids.includes(channel_id)) {
          text += "\n" + entryFoundText;
          keyboard = KEYBOARD_INLINE_REMOVE;
        } else {
          text += "\n" + entryNotFoundText;
          keyboard = KEYBOARD_INLINE_ADD;
        }
        sendMessage(chat_id,text,keyboard);
      }
      // Logger.log(text);
  }
  SpreadsheetApp.openById(spreadSheetId).getSheetByName("Log").getRange("A2").setValue(contents); //check the response at sheet named Log
}