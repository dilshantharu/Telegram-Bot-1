const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

// Replace with your Telegram bot token
const token = process.env.BOT_TOKEN;

// Create a bot using polling
const bot = new TelegramBot(token, { polling: true });

// /start command response
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 'Hello! I am your bot.');
});

// Example /getdata command using Axios
bot.onText(/\/getdata/, async (msg) => {
  const chatId = msg.chat.id;

  try {
    const response = await axios.get('https://jsonplaceholder.typicode.com/todos/1');
    bot.sendMessage(chatId, `Here is your data: ${JSON.stringify(response.data)}`);
  } catch (error) {
    bot.sendMessage(chatId, 'Sorry, an error occurred while fetching the data.');
  }
});
