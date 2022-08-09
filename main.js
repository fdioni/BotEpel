const fs = require("fs");
const {Client, Intents, Collection, GatewayIntentBits} = require("discord.js");
const moment = require("moment");
const Sequelize = require("sequelize");
const config = require("./config.js");
const { version } = require("./package.json");
const database = require("./config/config.json");
const bodyParser = require('body-parser');

const announcerRouter = require('./auto-announcer.js');

const express = require('express')

const client = new Client({intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES]});
client.commands = new Collection();

const commandFiles = fs
  .readdirSync("./commands")
  .filter(file => file.endsWith(".js"));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.name, command);
}

const sequelize = new Sequelize(
  database.development.database,
  database.development.username,
  database.development.password,
  {
    host: database.development.host,
    dialect: database.development.dialect,
    logging: false,
    dialectOptions: {
      timezone: "+07:00"
    }
  }
);

client.on("ready", () => {
  client.user.setActivity(config.activity);
  sequelize
    .authenticate()
    .then(() => {
      console.log("Connection has been established successfully.");
    })
    .catch(err => {
      console.error("Unable to connect to the database:", err);
    });
  console.log("BotEpel version: " + version + " is ready and active!");
  console.log(
    "My Active Time was at " + moment().format("dddd DD MMMM YYYY HH:mm:ss Z")
  );

  //client.channels.cache.get(config.textChannelID.live).send('Hello here!')

  //const liveChannel = client.channels.cache.get(config.textChannelID.live);

  //module.export = liveChannel;

  client.channels.cache.get(config.textChannelID.live).createWebhook("Some Username",{
    name: 'Some-username',
    avatar: 'https://i.imgur.com/AfFp7pu.png',
  })
    .then(webhook => console.log(`Created webhook ${webhook}`))
    .catch(console.error);
});

client.channels.fetch(config.textChannelID.live).then((value) => {

  console.log(value);

  //value.send('Hello here!');
}) 

client.on("message", message => {
  if (!message.content.startsWith(config.prefix) || message.author.bot) return;

  const args = message.content.slice(config.prefix.length).split(/ +/);
  const command = args.shift().toLowerCase();
  if (!client.commands.has(command)) return;

  try {
    client.commands.get(command).execute(message, args);
  } catch (error) {
    console.error(error);
    message.reply("There was an error trying to execute that command!");
  }

  module.exports = message;
});

client.login(config.token);

module.exports = client;

//express Web Server for Notification
const app = express()

app.use(bodyParser.text({ type: 'application/atom+xml' }))

app.get('/', async (req, res) => {
  res.send("BotEpel version: " + version + " is ready and active!")
})

app.use('/youtube',announcerRouter);

const port = 3000;
app.listen(port, () => console.log(`App listening on port ${port}!`))