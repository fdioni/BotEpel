const config = require('../config.js');

const name = 'gws';
const description = 'Says Get well soon to someone';

const execute = (message, args) => {
  if (args.length > 0) {
    message.channel.send(`gws yaa buat kamu, ${args[0]}~~`);
    return;
  }
  return message.reply('gws juga yaa kamu~~');
};

module.exports = {
  name,
  description,
  execute
};