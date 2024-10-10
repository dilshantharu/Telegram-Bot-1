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
  bot.sendMessage(chatId, 'Hello! I am your bot.');
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

console.log("Bot is running...");

