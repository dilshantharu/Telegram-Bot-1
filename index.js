const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

// -------------------------------THARU------------------------------

const token = process.env.BOT_TOKEN;
const weatherApiKey = process.env.WEATHER_API_KEY ;
const NEWS_API_KEY = process.env.NEWS_API_KEY ; 
const project_url = 'https://healthy-complex-lead.glitch.me';

// Create a bot using polling
const bot = new TelegramBot(token, { polling: true });

setInterval(async () => {
    try {
        await axios.get(project_url); // Replace with your Glitch URL
        console.log('Pinged the app to keep it awake!');
    } catch (error) {
        console.error('Error pinging the app:', error);
    }
}, 300000); // Ping every 5 minutes


// /start command response
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;

  const welcomeMessage = `*Welcome to BotfyX!* 🤖\n\n` +
    `I’m here to help you with a variety of tasks and make your experience enjoyable and efficient.\n` +
    `Whether you need assistance or want to stay updated, I’ve got you covered!\n\n` +
    `\`Developed by: THARU\``;

  const options = {
    caption: welcomeMessage,
    parse_mode: 'Markdown',
    reply_markup: {
      inline_keyboard: [
        [{ text: "📢 Explore Channels", url: "https://t.me/yourchannel" }],
        [{ text: "ℹ️ Help", callback_data: 'help' }, { text: "📄 About", callback_data: 'about' }],
        [{ text: "🚀 Get Started", callback_data: 'get_started' }]
      ]
    }
  };

  // Replace '/path/to/image.png' with your actual image path or URL
  const imagePath = 'https://iili.io/29ntynj.md.jpg';
  
  bot.sendPhoto(chatId, imagePath, options);
});

// Handling button callbacks
bot.on('callback_query', (callbackQuery) => {
  const chatId = callbackQuery.message.chat.id;
  const action = callbackQuery.data;

  if (action === 'help') {
    bot.sendMessage(chatId, 'ℹ️ Here is how you can use the bot: ...');
  } else if (action === 'about') {
    bot.sendMessage(chatId, '🤖 This bot was created to help you with various tasks like fetching news, quotes, and more.');
  } else if (action === 'get_started') {
    bot.sendMessage(chatId, '🚀 Let’s get started! You can begin by trying out one of the features.');
  }
});


bot.onText(/\/weather(.*)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const city = match[1].trim(); // Extract city name, trim whitespace

    if (!city) {
        // If no city is provided, send a reply asking for the correct usage
        bot.sendMessage(chatId, '❗ Please provide a city name like this: /weather <city>', {
            reply_to_message_id: msg.message_id
        });
    } else {
        try {
            const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${weatherApiKey}&units=metric`);
            const weatherData = response.data;

            // Add appropriate emojis for the weather
            const weatherIcons = {
                Clear: '☀️',
                Clouds: '☁️',
                Rain: '🌧️',
                Snow: '❄️',
                Thunderstorm: '⛈️',
                Drizzle: '🌦️',
                Mist: '🌫️',
                Smoke: '🌫️',
                Haze: '🌫️',
                Dust: '🌫️',
                Fog: '🌫️',
                Sand: '🌫️',
                Ash: '🌋',
                Squall: '💨',
                Tornado: '🌪️'
            };

            const weatherMain = weatherData.weather[0].main;
            const weatherEmoji = weatherIcons[weatherMain] || '🌍'; // Default to globe emoji if no match

            const weatherText = `
${weatherEmoji} *Weather in ${weatherData.name}:*

🌡️ Temperature: ${weatherData.main.temp}°C
🌤️ Weather: ${weatherData.weather[0].description}
💧 Humidity: ${weatherData.main.humidity}%
💨 Wind Speed: ${weatherData.wind.speed} m/s
            `;

            // Reply to the message that triggered the command
            bot.sendMessage(chatId, weatherText, {
                parse_mode: 'Markdown',
                reply_to_message_id: msg.message_id
            });
        } catch (error) {
            bot.sendMessage(chatId, '❌ Sorry, I couldn’t fetch the weather for that location. Please try again.', {
                reply_to_message_id: msg.message_id
            });
        }
    }
});

// Function to generate a random number
function random(from, min = 0) {
    return Math.floor(Math.random() * from) + min;
}

// Function to fetch a random quote
async function getRandomQuote() {
    const pageId = random(10);
    const fileId = pageId * 50 + random(50, 1);
    const file = (fileId < 10 ? "00" : fileId < 100 ? "0" : "") + fileId;

    const url = `https://raw.githubusercontent.com/ravindu01manoj/Quotes-500k/master/page${pageId}/quotes-${file}-manoj.json`;

    try {
        const res = await axios.get(url);
        const quotes = res.data.data;
        return quotes[random(quotes.length)];
    } catch (error) {
        console.error("Error fetching quotes:", error);
        throw new Error("Failed to fetch quotes");
    }
}

// Handle /quote command
bot.onText(/\/quote/, async (msg) => {
    const chatId = msg.chat.id;

    try {
        const quote = await getRandomQuote();
        const responseMessage = `📜 *Quote:* "${quote.quote}"\n\n👤 *Author:* ${quote.author}`;

        const options = {
            reply_markup: {
                inline_keyboard: [[
                    { text: "Get New Quote", callback_data: 'new_quote' }
                ]]
            },
            parse_mode: 'Markdown'
        };

        bot.sendMessage(chatId, responseMessage, options);
    } catch (error) {
        console.error("Error fetching quote:", error);
        bot.sendMessage(chatId, "❌ Failed to fetch a quote. Please try again later.");
    }
});

// Handling callback query for new quote
bot.on('callback_query', async (query) => {
    if (query.data === 'new_quote') {
        const chatId = query.message.chat.id;

        await bot.answerCallbackQuery(query.id); // Acknowledge the callback

        try {
            const quote = await getRandomQuote();
            const responseMessage = `📜 *Quote:* "${quote.quote}"\n\n👤 *Author:* ${quote.author}`;

            const options = {
                reply_markup: {
                    inline_keyboard: [[
                        { text: "Get New Quote", callback_data: 'new_quote' }
                    ]]
                },
                parse_mode: 'Markdown'
            };

            await bot.editMessageText(responseMessage, {
                chat_id: chatId,
                message_id: query.message.message_id,
                reply_markup: options.reply_markup,
                parse_mode: options.parse_mode
            });
        } catch (error) {
            console.error("Error fetching new quote:", error);
            bot.sendMessage(chatId, "❌ Failed to fetch a new quote. Please try again later.");
        }
    }
});

// NewsAPI endpoint
const getNewsUrl = (query) => `https://newsapi.org/v2/everything?q=${query}&apiKey=${NEWS_API_KEY}`;

// To store current news state per chat
const newsData = {};

// Handle /news command
bot.onText(/\/news(.*)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const query = match[1].trim(); // Get the topic from the user's message

    if (!query) {
        bot.sendMessage(chatId, '❗ Please provide a news topic. Example: /news technology');
        return;
    }

    const url = getNewsUrl(query);

    try {
        // Fetch news from NewsAPI
        const response = await axios.get(url);
        const articles = response.data.articles;

        if (articles.length === 0) {
            bot.sendMessage(chatId, `❌ No news found for: ${query}`);
            return;
        }

        // Store articles and initialize index for chat
        newsData[chatId] = { articles, index: 0 };

        // Send the first article
        sendNewsArticle(chatId, 0);
    } catch (error) {
        console.error('Error fetching news:', error);
        bot.sendMessage(chatId, '❌ Failed to fetch news. Please try again later.');
    }
});

// Function to send a specific news article
function sendNewsArticle(chatId, index) {
    const article = newsData[chatId].articles[index];
    const buttons = [
        [
            { text: '⬅️ Previous', callback_data: 'previous' },
            { text: 'Next ➡️', callback_data: 'next' }
        ]
    ];

    const caption = `📰 *${article.title}*\n_${article.description}_\n[Read more](${article.url})`;

    // Send article image with caption
    if (article.urlToImage) {
        bot.sendPhoto(chatId, article.urlToImage, {
            caption: caption,
            parse_mode: 'Markdown',
            reply_markup: {
                inline_keyboard: buttons
            }
        });
    } else {
        bot.sendMessage(chatId, caption, {
            parse_mode: 'Markdown',
            reply_markup: {
                inline_keyboard: buttons
            }
        });
    }
}

// Handle button presses for news navigation
bot.on('callback_query', (callbackQuery) => {
    const chatId = callbackQuery.message.chat.id;
    const action = callbackQuery.data;

    // Check if the action is for news navigation
    if (action === 'next' || action === 'previous') {
        let index = newsData[chatId].index;

        if (action === 'next') {
            index = (index + 1) % newsData[chatId].articles.length; // Loop to the start if at the end
        } else if (action === 'previous') {
            index = (index - 1 + newsData[chatId].articles.length) % newsData[chatId].articles.length; // Loop to the end if at the start
        }

        // Update the current index
        newsData[chatId].index = index;

        // Edit the message to show the new article
        bot.deleteMessage(chatId, callbackQuery.message.message_id);
        sendNewsArticle(chatId, index);
    }
});


const ehiImagePath = 'https://iili.io/29ntynj.md.jpg'; // Update this with your image URL
const channelMessageLink = 'https://t.me/your_channel_link'; // Update with your channel link

// Command to handle /ehi

bot.onText(/\/ehi/, (msg) => {

    const chatId = msg.chat.id; // The chat where the command is issued



    const caption = "🌟 Get your EHI config directly from our channel! 🌟\n\nClick below to explore available packages or get ehi."; // Updated caption



    const options = {

        reply_markup: {

            inline_keyboard: [

                [

                    {

                        text: "📦 Available Packages",

                        callback_data: 'available_packages'

                    },

                    {

                        text: "🔗 Get EHI",

                        url: channelMessageLink // Link to your channel message

                    }

                ],

                [

                    {

                        text: "📖 How to Use",

                        callback_data: 'how_to_use' // This will trigger another message or popup

                    }

                ]

            ]

        }

    };



    // Send image with caption and buttons

    bot.sendPhoto(chatId, ehiImagePath, { caption: caption, ...options })

        .then(() => {

            console.log('EHI information sent successfully!');

        })

        .catch((error) => {

            console.error('Error sending EHI information:', error);

            bot.sendMessage(chatId, `❌ Failed to send EHI information. Error: ${error.message}`);

        });

});



// Handle button callbacks for available packages and how to use

bot.on('callback_query', (query) => {

    const chatId = query.message.chat.id;



    if (query.data === 'available_packages') {

        // Show an alert message for available packages

        bot.answerCallbackQuery(query.id, {

            text: '📦 Available Packages:\n1. Basic Package - $5\n2. Standard Package - $10\n3. Premium Package - $15\nVisit our channel for more details!',

            show_alert: true // This makes it an alert-style popup

        });

    }



    if (query.data === 'how_to_use') {

        // Reply with the instructions on how to use the EHI file

        bot.sendMessage(chatId, '📖 To use the EHI file:\n1. Download HTTP Injector.\n2. Import the EHI file.\n3. Start the connection.\nFor detailed steps, visit our channel!');

    }

});

console.log("Bot is running...");
