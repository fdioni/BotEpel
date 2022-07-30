const { name: bot_name, version } = require("../package.json");

const name = "about";
const description = "About this BOT";

const execute = (message) => {
  message.channel.send(
    "```Hello my name is " + bot_name +" v" + version +". At your Service!\nMy master is: seiso-chan (https://github.com/seisochan)\nOriginally coded by Ryuujo```"
  );
}

module.exports = {
  name,
  description,
  execute
};
