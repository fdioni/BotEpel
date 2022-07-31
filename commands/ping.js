
const name = "ping";
const description = "Ping me if you or this bot feel laggy";

const execute = (message, args) => {
  message.channel.send(`**Pong.** Aku di sini~ Latensinya:  ${Date.now() - message.createdTimestamp}ms.`);
}

module.exports = {
  name,
  description,
  execute
};
