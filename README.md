# mytvbot

This is a working bot to control my LG TV. Anyone can use it just by creating a bot and setting these environment variables:

1. `TELEGRAM_BOT_TOKEN` - the bot token
1. `RESTRICTED_CHAT_ID` - the specific chat id for your chat with the bot. Otherwise anyone can control your TV!
1. `TV_IP_ADDRESS` - ip address of the TV

The bot must be able to connect to `TV_IP_ADDRESS`. I use a Raspberry Pi inside my local network, and [Homebridge](https://github.com/nfarina/homebridge), with an iPad as hub.

At this moment, all it can do is change volume and send a toast message to be displayed on the TV.

## Commands:

* `/vol <integer>`
* `/toast <message>`

## Motivation

I live with couch potatoes, so they often ignore their phones. I use this to send a message on the TV to get their attention.

## Special Thanks

* [lgtv2](https://www.npmjs.com/package/lgtv2)
