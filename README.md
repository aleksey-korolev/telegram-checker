# telegram-checker
Backend stub for a telegram bot that needs to check if a telegram channel or group is in the list. Implement your own spam checker, age restriction checker or any other verification type of bot based on a convenient human-editable list of channels/groups in a google spreadsheet.

Steps to setup your own bot and backend for it:
1. Register new telegram bot using Telegram official bot father bot: https://t.me/botfather. Make note of the returned token.
2. Create a Google spreadsheet that will keep list of ids as well as web application to process requests from your bot.
3. Rename 1st sheet to "Ids" and set cell A1 value to "Id" - 1st row will be the header row.
4. Fill 1st column with ids of telegram channels and groups that need to be detected by bot starting with cell A2.
5. Create a bound script in the created spreadsheet: select Extensions > Apps Script and paste App Script code from bot-backend.js
6. Set token value obtained when registering the bot to var token in the script.
7. Deploy the App Script using Deploy button. Note the URL of deployed web application - this is your bot backend.
8. Register backend url as bot webhook by sending following request: https://api.telegram.org/bot{token}/setWebhook?url={backend url}

Check your bot:
1. Check that webhook was set https://api.telegram.org/bot{token}/getWebhookInfo
2. Forward a message from a channel that is in the list to the bot, it must respond that it detected that the channel is in the list
3. Do the same with a channel that is NOT in the list, bit must respond that it detected that the channel is NOT in the list 
