// -------------------------------THARU------------------------------


const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const FormData = require('form-data');
const fetch = require("node-fetch");
const fs = require("fs");

const token = process.env.BOT_TOKEN;
const weatherApiKey = process.env.WEATHER_API_KEY ;
const NEWS_API_KEY = process.env.NEWS_API_KEY ; 
const project_url = 'https://healthy-complex-lead.glitch.me';
const WIT_AI_TOKEN = process.env.WIT_AI_API_KEY;

// Create a bot using polling
const bot = new TelegramBot(token, { polling: true });

// -------------------------------Keep Running------------------------------


setInterval(async () => {
    try {
        await axios.get(project_url); // Replace with your Glitch URL
        console.log('Pinged the app to keep it awake!');
    } catch (error) {
        console.error('Error pinging the app:', error);
    }
}, 300000); // Ping every 5 minutes

// -------------------------------/start Command------------------------------


// /start command response
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;

  const welcomeMessage = `<b>Welcome to BotfyX! 🤖</b>\n\n` +
    `I’m here to help you with a variety of tasks and make your experience enjoyable and efficient.\n` +
    `Whether you need assistance or want to stay updated, I’ve got you covered!\n\n` +
    `🧑‍💻 ᴅᴇᴠᴇʟᴏᴘᴇᴅ ʙʏ : <a href="t.me/itstharu">ᴛʜᴀʀᴜ</a>\n\n` + `---`;

  const options = {
    caption: welcomeMessage,
    parse_mode: 'HTML',
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
    const aboutMessage = `<b>About BotfyX</b> 🤖\n\n` +
      `BotfyX is your intelligent assistant designed to enhance your experience and streamline your tasks. ` +
      `Whether you need help with various tasks or just want to stay updated, BotfyX is here to assist you!\n\n` +
      `<b>About Developer</b>\n` +
      `Developed by THARU, with a passion for technology and a commitment to providing useful solutions, I'm dedicated to making your interactions seamless and enjoyable.`;

    const options = {
      reply_markup: {
        inline_keyboard: [
          [{ text: "📢 Join Our Channel", url: "https://t.me/yourchannel" }],
          [{ text: "🌐 Visit My Website", url: "https://yourwebsite.com" }],
          [{ text: "📩 Contact Me", url: "https://t.me/yourusername" }]
        ]
      }
    };
    
  bot.sendSticker(chatId, `CAACAgIAAxkBAAIB-2cInzJtjQmjoglMgpQ77nTisjJiAAJxUAACD2hJSC4xAs2a9HmUNgQ`)
    .then(() => {
    bot.sendMessage(chatId, aboutMessage, { parse_mode: 'HTML', reply_markup: options.reply_markup }); });
} else if (action === 'get_started') {
    bot.sendMessage(chatId, '🚀 Let’s get started! You can begin by trying out one of the features.');
  }
});

// -------------------------------/about Command------------------------------


bot.onText(/\/about/, (msg) => {
  const chatId = msg.chat.id;

  const aboutMessage = `<b>About BotfyX</b> 🤖\n\n` +
    `BotfyX is your intelligent assistant designed to enhance your experience and streamline your tasks. ` +
    `Whether you need help with various tasks or just want to stay updated, BotfyX is here to assist you!\n\n` +
    `<b>About Developer</b>\n` +
    `Developed by THARU, with a passion for technology and a commitment to providing useful solutions, I'm dedicated to making your interactions seamless and enjoyable.`;

  const options = {
    reply_markup: {
      inline_keyboard: [
        [{ text: "📢 Join Our Channel", url: "https://t.me/yourchannel" }],
        [{ text: "🌐 Visit My Website", url: "https://yourwebsite.com" }],
        [{ text: "📩 Contact Me", url: "https://t.me/yourusername" }]
      ]
    }
  };

  // Send the about message with buttons
  bot.sendSticker(chatId,`CAACAgIAAxkBAAIB-2cInzJtjQmjoglMgpQ77nTisjJiAAJxUAACD2hJSC4xAs2a9HmUNgQ`)
    .then(() => {
    
        return  bot.sendMessage(chatId, aboutMessage, { parse_mode: 'HTML', reply_markup: options.reply_markup }); 
    
    }) ;
});

// -------------------------------/weather Command------------------------------


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

// -------------------------------/quote Command------------------------------


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

// -------------------------------/news Command------------------------------


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

// -------------------------------/ehi Command------------------------------


const ehiImagePath = 'https://iili.io/29ntynj.md.jpg'; // Update this with your image URL
const channelMessageLink = 'https://t.me/your_channel_link'; // Update with your channel link

// Command to handle /ehi

bot.onText(/\/ehi/, (msg) => {

    const chatId = msg.chat.id; // The chat where the command is issued



    const caption = `🌟 <b>Get your EHI config directly from our channel!</b> 🌟\n\n` +
    `<b>EHI</b> කියන්නේ <b>free internet</b> access කරන්න පුළුවන් config file එකක්. ඔබට මේ file එක HTTP Injector app එකේ upload කරල, VPN configurations නිවැරදිව adjust කරලා, free internet එකක් භාවිතා කළ හැකියි.\n\n` +
    `Click below to explore available packages or get more info on <b>EHI</b>.`; // Updated caption



    const options = {

        reply_markup: {

            inline_keyboard: [

              [
                { text: "🌐 Free Internet Info", callback_data: 'free_internet' }
              ],  
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

    bot.sendPhoto(chatId, ehiImagePath, { caption: caption, ...options, parse_mode: "HTML" })

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

            text: `🍃 𝘈𝘝𝘈𝘐𝘓𝘈𝘉𝘓𝘌 𝘗𝘈𝘊𝘒𝘈𝘎𝘌𝘚🍃\n\n✯ ᴡʜᴀᴛsᴀᴘᴘ\n✯ ʏᴏᴜᴛᴜʙᴇ\n✯ ᴢᴏᴏᴍ\n✯ ғᴀᴄᴇʙᴏᴏᴋ & 𝙼𝙾𝚁𝙴\n\n𝙹𝙾𝙸𝙽 𝙾𝚄𝚁 𝙲𝙷𝙰𝙽𝙽𝙴𝙻 𝙵𝙾𝚁 𝙼𝙾𝚁𝙴 𝚄𝙿𝙳𝙰𝚃𝙴𝚂\n\n---`,

            show_alert: true // This makes it an alert-style popup

        });

    }



    if (query.data === 'how_to_use') {

        // Reply with the instructions on how to use the EHI file

        bot.sendVideo(chatId, `https://cdn.glitch.global/f1a7f145-0df8-4c7b-a340-9fc6acc4d280/VN20241011_114552.mp4?v=1728628251149`, {
          parse_mode:"HTML",
          caption: `🌷 𝙰𝚗𝚍𝚛𝚘𝚒𝚍 𝙵𝚛𝚎𝚎 𝙸𝚗𝚝𝚎𝚛𝚗𝚎𝚝 𝚂𝚎𝚝𝚞𝚙 🌷

✍️ දැනට තියෙන Package එකට අදාළ File එක අරගෙන, Video එකේ තියෙන විදිහට File Open කරගෙන Connect ( Start )  දුන්නට පස්සේ  Log එකේ Connected or VPN Connected කියල වැටෙනවද කියල බලන්න.එහෙම වැටෙනව නම් වැඩේ ගොඩ. 🥳🥳🥳 , Connect උනාට පස්සේ ඔයාල Data Use කරන හැම එකකටම Data Charge වෙන්නේ Normal Data වලින් නෙමෙයි ,ඔයාලගේ Package එකෙන්, Package එක Unlimited නම් Data ත් Unlimited තමයි 😁

- Available Files : -

• Http Injector ( EHI )
• Stocks Http  ( SKS )
• HTTP Custom ( HC )
• Http Injector Lite ( EHIL )
• TLS Tunnel  (TLS )`
        });

    }
  
  if (query.data === 'free_internet') {
    bot.sendMessage(chatId, `<b>💢 Free Internet කියන්නෙ මොකක්ද?</b>
Free internet කියලා කිව්වට, internet free use කිරීමට ඔබ පකේජයක් activate කර තිබිය යුතුයි.

<b>💢 එතකොට free internet කියන්නෙ මොකක්ද?</b>
Free internet කියන්නේ ඔබ activate කරන පැකේජයෙන් අනිත් social media වැනි දේවල් භාවිතා කිරීමටයි.

<b>💡 උදාහරණ:</b>
Mobitel Rs 99 Social Package ය activate කර දුරකථනයේ ඩේටා විරහිතව YouTube, WhatsApp වැනි දෑ භාවිතා කිරීම.

<b>🌐 Free Internet Use කරන්නෙ කොහොමද?</b>
Free internet use කිරීමට ඔබට <b>VPN</b> එකක් භාවිතා කිරීමට සිදුවේ.

<b>🔍 භාවිතා කිරීමට සුදුසු VPN මොනවද?</b>
<b>📱 දුරකථන සඳහා (Android):</b>
- HTTP Injector
- HTTP Injector Lite
- TLS Tunnel
- HTTP Custom

<b>💻 පරිඝණක සඳහා (Windows):</b>
- SVL Injector
- HTTP Proxy Injector
- TCP Over SSL Tunnel

<b>✅ මෙතනින් Recommend කළ හැක්කේ කුමන VPN Application ද?</b>
- HTTP Injector
- HTTP Injector Lite
- SVL Injector
- HTTP Proxy Injector

<b>❓ මෙම VPN install කර විගසම ඔබට FREE DATA USE කළ හැකිද?</b>
බැහැ, මොකද ඔබ මෙම VPN එකට අවශ්‍ය සෙටින්ග්ස් සකසා ගත යුතුයි.

<b>🔧 කොහොමද එහෙම හදාගන්නෙ? මොනවද මේ CONFIG FILES කියන්නෙ?</b>
CONFIG FILES යනු අදාළ VPN අදාළ සෙටින්ග්ස් ඇතුළත් FILES වේ.

<b>🌟 උදාහරණ:</b>
- HTTP Injector - EHI FILES
- HTTP Injector Lite - EHIL FILES
- SVL Injector - SVI FILES
- HTTP Proxy Injector - HPI FILES
`, {parse_mode: "HTML"});
  }

});

// -------------------------------Repeat Stickers------------------------------

bot.on('message', (msg) => {
  // Check if the message contains a sticker
  if (msg.sticker) {
    console.log(`Sticker ID: ${msg.sticker.file_id}`);
    bot.sendSticker(msg.chat.id, `${msg.sticker.file_id}`);
  } else {
    return ; 
  }
});

// -------------------------------/stock Command------------------------------

// Command to get stock data

bot.onText(/\/stock(?:\s+(.+))?/, async (msg, match) => {

  const chatId = msg.chat.id;

  const stockSymbol = match[1]; // Get the stock symbol from user input



  if (!stockSymbol) {

    // If the user did not provide a stock symbol

    bot.sendMessage(chatId, `🚨 *Oops!* It looks like you forgot to provide a stock symbol. Please try again using the format:\n\n✨ /stock <symbol>\n\n*Examples:*\n- /stock MSFT\n- /stock AAPL\n- /stock TSLA\n\nHappy trading! 📈`, {parse_mode:"Markdown"});

    return;

  }



  const options = {

    method: 'GET',

    url: 'https://alpha-vantage.p.rapidapi.com/query',

    params: {

      function: 'TIME_SERIES_DAILY',

      symbol: stockSymbol.toUpperCase(), // Use the stock symbol from user input

      outputsize: 'compact',

      datatype: 'json'

    },

    headers: {

      'x-rapidapi-key': 'b6fa6e167emsh999865817f23a74p1eaf45jsnb17a89660952',

      'x-rapidapi-host': 'alpha-vantage.p.rapidapi.com'

    }

  };



  try {

    const response = await axios.request(options);

    const stockData = response.data;



    // Check if the API returned stock data

    const dailyData = stockData['Time Series (Daily)'];

    if (!dailyData) {

      bot.sendMessage(chatId, `❌ *Error:* Could not retrieve stock data for symbol *${stockSymbol.toUpperCase()}*. Please check the symbol and try again.`, {parse_mode:"Markdown"});

      return;

    }



    const latestDate = Object.keys(dailyData)[0]; // Get the most recent date

    const latestStockInfo = dailyData[latestDate]; // Get stock info for that date



    const replyMessage = `📊 *Stock Information*\n\n🔍 *Symbol:* ${stockSymbol.toUpperCase()}\n📅 *Date:* ${latestDate}\n💵 *Open:* $${latestStockInfo['1. open']}\n🔼 *High:* $${latestStockInfo['2. high']}\n🔽 *Low:* $${latestStockInfo['3. low']}\n💰 *Close:* $${latestStockInfo['4. close']}`;



    bot.sendMessage(chatId, replyMessage, { parse_mode: 'Markdown' });

  } catch (error) {

    console.error('Error fetching stock data:', error.response ? error.response.data : error.message);

    bot.sendMessage(chatId, `⚠️ *Failed to fetch stock data.* Please try again later.`, {parse_mode: "Markdown"});

  }

});

// -------------------------------IMG Commandd------------------------------

// Function to remove background from the image

async function removeBg(imageURL) {

  const formData = new FormData();

  formData.append("size", "auto");

  formData.append("image_url", imageURL);



  const response = await fetch("https://api.remove.bg/v1.0/removebg", {

    method: "POST",

    headers: { "X-Api-Key": process.env.RMBG_API_KEY }, // Replace with your actual API key

    body: formData,

  });



  if (response.ok) {

    return await response.buffer(); // Return the image buffer

  } else {

    throw new Error(`${response.status}: ${response.statusText}`);

  }

}



// Function to upload image to imgbb

async function uploadToImgbb(imageURL) {

  const formData = new FormData();

  formData.append("image", imageURL);



  const response = await fetch("https://api.imgbb.com/1/upload?key=" + process.env.IMGBB_API_KEY, {

    method: "POST",

    body: formData,

  });



  if (response.ok) {

    const data = await response.json();

    return data.data.url; // Return the image URL

  } else {

    throw new Error(`${response.status}: ${response.statusText}`);

  }

}



// Listen for photos

let latestPhotoFileId;

bot.on('photo', async (msg) => {

  const chatId = msg.chat.id;

  const fileId = msg.photo[msg.photo.length - 1].file_id; // Get the highest resolution photo

  latestPhotoFileId = fileId; // Save file ID for later use



  // Send service options with inline keyboard

  const serviceKeyboard = {

    reply_markup: {

      inline_keyboard: [

        [

          { text: "Upload to imgbb", callback_data: "upload_imgbb" },
        ],

        [
          { text: "Remove Background", callback_data: "remove_bg" }

        ]

      ]

    }

  };



  bot.sendMessage(chatId, "Choose a service from the following:", serviceKeyboard);

});



// Handle callback queries (button clicks)

bot.on('callback_query', async (query) => {

  const chatId = query.message.chat.id;



  /*if (!latestPhotoFileId) {

    bot.answerCallbackQuery(query.id, { text: "⚠️ No image found! Please send a photo first.", show_alert: true });

    return;

  }*/



  // Get the link to the last photo sent by the user

  const fileLink = await bot.getFileLink(latestPhotoFileId);



  if (query.data === "upload_imgbb") {

    bot.sendMessage(chatId, "*📤 Uploading to imgbb...*", {parse_mode: "Markdown"}).then(async (msg) => {

      try {

        const imgbbLink = await uploadToImgbb(fileLink);

        bot.editMessageText(`*✅ Image uploaded!*\n\n🔗 Here is your image link: ${imgbbLink}`, {

          chat_id: chatId,

          message_id: msg.message_id,

          parse_mode: "Markdown"

        });

      } catch (error) {

        console.error('Error uploading to imgbb:', error.message);

        bot.editMessageText('*⚠️ Failed to upload image to imgbb. Please try again later.*', {

          chat_id: chatId,
          parse_mode: "Markdown",
          message_id: msg.message_id

        });

      }

    });

  } else if (query.data === "remove_bg") {

    bot.sendMessage(chatId, "*📤 Uploading to Removebg...*", {parse_mode: "Markdown"}).then(async (msg) => {

      try {

        const rbgResultData = await removeBg(fileLink);

        const outputFilePath = 'rmbg.png';

        fs.writeFileSync(outputFilePath, rbgResultData); // Save the processed image



        await bot.editMessageText('*🔄 Removing background...*', {

          chat_id: chatId,
          parse_mode: "Markdown",
          message_id: msg.message_id

        });



        // Send the processed image back to the user as a document

        await bot.sendDocument(chatId, outputFilePath, {

          caption: '*✅ Background removed!*',

          parse_mode: "Markdown"

        });



        // Optionally, delete the local file after sending

        fs.unlinkSync(outputFilePath);

      } catch (error) {

        console.error('Error processing the image:', error.message);

        bot.editMessageText('⚠️ Failed to remove the background. Please try again later.', {

          chat_id: chatId,

          message_id: msg.message_id

        });

      }

    });

  }



  bot.answerCallbackQuery(query.id); // Acknowledge the callback query to remove the "loading" state of the button

});

// -------------------------------/insta Command------------------------------
 
bot.onText(/\/insta(?:\s+(.+))?/, async (msg, match) => {
    const chatId = msg.chat.id;
    const instagramUrl = match[1];

    // If the user did not provide a link
    if (!instagramUrl) {
        return bot.sendMessage(chatId, "⚠️ Please provide an Instagram link. Usage: */insta <link>*", {
            parse_mode: "Markdown"
        });
    }

    // Send a "Downloading..." message to indicate the download status
    let statusMessageId;
    try {
        const statusMessage = await bot.sendMessage(chatId, "*⬇️ Downloading your Instagram media...*", {
            parse_mode: "Markdown"
        });
        statusMessageId = statusMessage.message_id;
    } catch (error) {
        console.error("Error sending status message:", error);
        return;
    }

    // Configure the API request to fetch the Instagram video
    const options = {
        method: 'GET',
        url: 'https://instagram-downloader-download-instagram-videos-stories1.p.rapidapi.com/get-info-rapidapi',
        params: {
            url: instagramUrl
        },
        headers: {
            'x-rapidapi-key': 'b6fa6e167emsh999865817f23a74p1eaf45jsnb17a89660952',
            'x-rapidapi-host': 'instagram-downloader-download-instagram-videos-stories1.p.rapidapi.com'
        }
    };

    try {
        // Fetch video data from the API
        const response = await axios.request(options);
        const videoUrl = response.data.download_url; // Adjust according to the API response structure
        const type = response.data.type || "media"; // Default to "media" if type is not provided
        const caption = `*✅ Here's your Instagram ${type}!*`; // Fallback custom caption

        if (videoUrl) {
            // Update the status message to indicate "Uploading..."
            await bot.editMessageText(`*⬆️ Uploading your Instagram ${type}...*`, {
                chat_id: chatId,
                message_id: statusMessageId,
                parse_mode: "Markdown"
            });

            // Send the video with the caption and an inline button
            await bot.sendVideo(chatId, videoUrl, {
                caption: caption,
                parse_mode: "Markdown",
                reply_markup: {
                    inline_keyboard: [[
                        {
                            text: "Watch on Instagram",
                            url: instagramUrl
                        }
                    ]]
                }
            });

            // Delete the status message after sending the video
            await bot.deleteMessage(chatId, statusMessageId);
        } else {
            // If no video is found, send a message indicating the issue
            await bot.editMessageText("No video found for the provided link.", {
                chat_id: chatId,
                message_id: statusMessageId,
                parse_mode: "Markdown"
            });
        }
    } catch (error) {
        console.error('Error fetching data from Instagram API:', error.message);
        // Update the status message to indicate a download failure
        await bot.editMessageText("Failed to download video. Please check the provided link.", {
            chat_id: chatId,
            message_id: statusMessageId,
            parse_mode: "Markdown"
        });
    }
});


console.log("Bot is running...");
