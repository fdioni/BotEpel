const config = require('../config.js');

const name = "aku";
const description = "Joke bapacc bapacc";

const execute = (message, args) => {
  if (args.length > 0) {
    const StringCoba = args.join(' ');
    message.channel.send(`Halo ${StringCoba}, aku BotEpel`);
    return;
  }
    return message.reply('Aku siapa?');
  };

module.exports = {
  name,
  description,
  execute
};