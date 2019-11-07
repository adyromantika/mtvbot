const TelegramBot = require('node-telegram-bot-api');
const lgtv = require('lgtv');

const token = process.env.TELEGRAM_BOT_TOKEN;
const restrictedChatId = process.env.RESTRICTED_CHAT_ID;
const tv_ip_address = process.env.TV_IP_ADDRESS;

const bot = new TelegramBot(token, {polling: true});

function connect() {
  if (! lgtv.connected())
    lgtv.connect(tv_ip_address, function(err, response){ });
}

/* Restrict to a single chat */
function checkIdAndConnect(id) {
  if (id != restrictedChatId) {
    return false;
  }
  connect();
  return true;
};

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  if (!checkIdAndConnect(chatId)) return;
  var keys = [];
  keys.push({text: "Volume 10", callback_data: "Vol10"});
  keys.push({text: "Volume 5", callback_data: "Vol5"});
  keys.push({text: "Mute", callback_data: "Mute"});
  var options = { reply_markup: ({inline_keyboard: [ keys ]}) };
  bot.sendMessage(chatId, "Your choices:", options);
});

bot.onText(/\/vol (.+)/, (msg, match) => {
  const chatId = msg.chat.id;
  if (!checkIdAndConnect(chatId)) return;
  const resp = Number(match[1]);
  lgtv.set_volume(resp, function(err, response){
    if (err) {
      bot.sendMessage(chatId, err);
    }
  });
});

bot.on('callback_query', (callbackQuery) => {
  const chatId = callbackQuery.message.chat.id;
  if (!checkIdAndConnect(chatId)) return;
  var vol = -1;
  switch (callbackQuery.data) {
    case 'Vol10':
      vol = 10;
      break;
    case 'Vol5':
      vol = 5;
      break;
    case 'Mute':
      vol = 0;
      break;
  }

  if (vol != -1) {
    lgtv.set_volume(vol, function(err, response){
      if (err) {
        bot.sendMessage(chatId, err);
      }
    });
  }
});

bot.onText(/\/echo (.+)/, (msg, match) => {
  const chatId = msg.chat.id;
  if (!checkIdAndConnect(msg.chat.id)) return;
  const resp = match[1];

  lgtv.show_float(resp, function(err, response){
    if (err) {
      bot.sendMessage(chatId, err);
    }
  });
});
