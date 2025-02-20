require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const axios = require('axios');
const express = require('express');
const fs = require('fs');
const { readFileSync } = require('fs');
// Express listener on the port (ensure this matches your server setup)
const app = express();


app.listen(3000, () => {
  console.log('Express server listening on port 3000');
});

app.get('/', (req, res) => {
  res.send('Online Yo Boy !');
});


// Initialize the Discord client with required intents
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

// Log when the bot is ready
client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);
});

// Command to fetch the Blox Fruits stock
client.on('messageCreate', async (message) => {
    if (message.content === '!stock') {
        try {
            const response = await axios.get('https://blox-fruit-stock-fruit.p.rapidapi.com/check_stock', {
                headers: {
                    'X-RapidAPI-Key': process.env.RAPIDAPI_KEY || readFileSync('api.txt', 'utf-8'),
                    'X-RapidAPI-Host': 'blox-fruit-stock-fruit.p.rapidapi.com',
                },
            });

            const stockData = response.data; // Get the response data

            // Check if stockData is in the expected format
            if (!Array.isArray(stockData) && stockData.fruits) {
                return message.channel.send('No stock data available or unexpected format.');
            }

            // Create an embed to display stock information
            const embed = new EmbedBuilder()
                .setTitle('Current Blox Fruits Stock')
                .setColor('#FFA500');

            // If stockData is an array, iterate through it
            if (Array.isArray(stockData.fruits)) {
                stockData.fruits.forEach((fruit) => {
                    embed.addFields({ name: fruit.name, value: `Price: ${fruit.price} Beli`, inline: true });
                });
            } else {
                embed.setDescription('No fruits are currently available.');
            }

            // Send the embed in the channel
            await message.channel.send({ embeds: [embed] });
        } catch (error) {
            console.error('Error fetching stock data:', error);
            message.channel.send('Sorry, I could not retrieve the stock information at this time.');
        }
    }
});

// Log in to Discord with the bot token
client.login(process.env.DISCORD_TOKEN || readFileSync('token.txt', 'utf-8'));