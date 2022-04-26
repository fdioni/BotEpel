const moment = require('moment');
const { Op } = require('sequelize');
const Schedule = require('../models').Schedule;
const Vtuber = require('../models').Vtuber;
const { name, version } = require('../package.json');

module.exports = {
  name: 'upcoming',
  description: 'Shows upcoming livestream from now or based on Vtuber',
  async execute(message, args) {
    moment.locale('id');
    const timeFormat = 'Do MMMM YYYY, HH:mm';
    const showEmbed = async (data, vtuberName) => {
      try {
        if (!data) {
          const embed = {
            title: vtuberName
              ? `Stream mendatang dari ${vtuberName}`
              : 'Belum ada stream mendatang',
            description: vtuberName
              ? `Saat ini belum ada stream mendatang dari ${vtuberName}.`
              : 'Belum ada stream mendatang untuk saat ini',
            footer: {
              text: `${name} v${version} - This message was created on ${moment()
                .utcOffset('+07:00')
                .format(timeFormat)}`,
            },
          };
          return message.channel.send({ embeds: [embed] });
        }
        const embed = {
          title: `${
            data.type === 'live' ? 'Stream' : 'Premiere'
          } mendatang dari ${vtuberName}`,
          color: parseInt(data['vtuber.color']),
          thumbnail: {
            url: data['vtuber.avatarURL'],
          },
          fields: [
            {
              name: `Tanggal & Waktu ${
                data.type === 'live' ? 'Stream' : 'Premiere'
              }`,
              value: `${moment(data.dateTime)
                .utcOffset('+07:00')
                .format(timeFormat)} GMT+7 / WIB\n(*${moment(
                data.dateTime
              ).fromNow()}*)`,
            },
            {
              name: 'Link Video Youtube',
              value: data.youtubeUrl,
            },
            {
              name: `Judul ${data.type === 'live' ? 'Stream' : 'Premiere'}`,
              value: data.title,
            },
          ],
          image: {
            url: data.thumbnailUrl,
          },
          footer: {
            text: `${name} v${version} - This message was created on ${moment()
              .utcOffset('+07:00')
              .format(timeFormat)}`,
          },
        };
        return message.channel.send({ embeds: [embed] });
      } catch (err) {
        message.reply(
          `Ada sesuatu yang salah, tapi itu bukan kamu: ${err.message}`
        );
      }
    };

    try {
      if (!args[0]) {
        const data = await Schedule.findOne({
          where: {
            dateTime: {
              [Op.gt]: new Date().setMinutes(new Date().getMinutes() - 10),
            },
          },
          order: [
            ['dateTime', 'ASC'],
            ['id', 'ASC'],
          ],
          raw: true,
          include: 'vtuber',
        });
        if (!data) {
          return showEmbed(data, null);
        }
        return showEmbed(data, data ? data['vtuber.fullName'] : null);
      } else {
        const vtuberFullName = args[0].toLowerCase();
        const vData = await Vtuber.findOne({
          where: { name: vtuberFullName },
        });
        if (!vData) {
          throw {
            message: `Kamu menginput ${vtuberFullName} dan itu tidak ada di database kami`,
          };
        }
        const data = await Schedule.findOne({
          where: {
            dateTime: {
              [Op.gt]: new Date().setMinutes(new Date().getMinutes() - 10),
            },
            vtuberId: vData.id,
          },
          order: [
            ['dateTime', 'ASC'],
            ['id', 'ASC'],
          ],
          raw: true,
          include: 'vtuber',
        });
        return showEmbed(data, vData.fullName);
      }
    } catch (err) {
      message.reply(
        `Ada sesuatu yang salah, tapi itu bukan kamu: ${err.message}`
      );
    }
  },
};
