const TelegramBot = require('node-telegram-bot-api');

const token = process.env.TELEGRAM_BOT_TOKEN;
const restrictedChatId = process.env.RESTRICTED_CHAT_ID;
const tv_ip_address = process.env.TV_IP_ADDRESS;

const lgtv = require("lgtv2")({
  url: 'ws://' + tv_ip_address + ':3000'
});
const bot = new TelegramBot(token, {polling: true});

lgtv.on('error', function (err) {
  console.log(err);
});

lgtv.on('connect', function () {
  console.log('Connected to TV');
  lgtv.subscribe('ssap://audio/getVolume', function (err, res) {
    if (res.changed.indexOf('volume') !== -1) console.log('Volume changed', res.volume);
    if (res.changed.indexOf('muted') !== -1) console.log('Mute changed', res.muted);
  });
});

lgtv.on('connecting', function () {
  console.log('Connecting to TV');
});

lgtv.on('close', function () {
  console.log('Connection to TV closed');
});

/* Restrict to a single chat */
function checkId(id) {
  if (id != restrictedChatId) {
    return false;
  }
  return true;
};

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  if (!checkId(chatId)) return;
  var keys = [];
  keys.push({text: "Volume 10", callback_data: "Vol10"});
  keys.push({text: "Volume 5", callback_data: "Vol5"});
  keys.push({text: "Mute", callback_data: "Mute"});
  var options = { reply_markup: ({inline_keyboard: [ keys ]}) };
  bot.sendMessage(chatId, "Your choices:", options);
});

bot.onText(/\/vol (.+)/, (msg, match) => {
  const chatId = msg.chat.id;
  if (!checkId(chatId)) return;
  const vol = Number(match[1]);
  lgtv.request('ssap://audio/setVolume', {volume: vol}, function(err, response){
    if (err) {
      bot.sendMessage(chatId, "==> " + err);
    }
    else {
      console.log("==> Volume: " + vol);
      bot.sendMessage(chatId, "==> Volume: " + vol);
    }
  });
});

bot.on('callback_query', (callbackQuery) => {
  const chatId = callbackQuery.message.chat.id;
  if (!checkId(chatId)) return;
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
    lgtv.request('ssap://audio/setVolume', {volume: vol}, function(err, response){
      if (err) {
        bot.sendMessage(chatId, "==> " + err);
      }
      else {
        console.log("==> Volume: " + vol);
        bot.sendMessage(chatId, "==> Volume: " + vol);
      }
    });
  }
});

bot.onText(/\/toast (.+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const resp = match[1];
  if (!checkId(msg.chat.id)) return;

  lgtv.request('ssap://system.notifications/createToast', {message: resp}, function(err, res) {
    if(err)
      bot.sendMessage(chatId, "==> " + err);
    else {
      console.log("==> Sent: " + resp);
      bot.sendMessage(chatId, "==> Sent: " + resp);
    }
  });
});
