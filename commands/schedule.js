const moment = require('moment');
const { Op } = require('sequelize');
const Schedule = require('../models').Schedule;
const Vtuber = require('../models').Vtuber;
const { name, version } = require('../package.json');

module.exports = {
  name: 'schedule',
  description: 'Check upcoming schedule',
  async execute(message, args) {
    moment.locale('id');
    const timeFormat = 'Do MMMM YYYY, HH:mm';

    const scheduleEmbed = (data, vtuberName, avatar) => {
      const embed = {
        color: parseInt(data.length !== 0 ? data[0]['vtuber.color'] : '0x000000'),
        title: vtuberName
          ? `Upcoming stream dari ${vtuberName}`
          : 'Upcoming Stream',
        thumbnail: {
          url: avatar,
        },
        description:
          data.length !== 0
            ? `${data
                .slice(0, 5)
                .map(
                  (d, i) =>
                    `${i + 1}. __**${d['vtuber.fullName']}**__ (${
                      d.type
                    })\nJudul Stream:** ${
                      d.title
                    }**\nTanggal dan Waktu: **${moment(d.dateTime)
                      .utcOffset('+07:00')
                      .format(timeFormat)} WIB / GMT+7** (*${moment(
                      d.dateTime
                    ).fromNow()}*)\n${d.youtubeUrl}\n\n`
                )
                .join('')}${
                data.length - 5 > 0
                  ? `***Dan ${data.length - 5} livestream lainnya...***`
                  : ''
              }`
            : '*Belum ada jadwal livestream untuk saat ini.*',
        footer: {
          text: `${name} v${version} - This message was created on ${moment()
            .utcOffset('+07:00')
            .format(timeFormat)}`,
        },
      };
      return message.channel.send({
        content: 'List Stream/Premiere yang akan datang: ',
        embeds: [embed],
      });
    };

    try {
      if (!args[0]) {
        const data = await Schedule.findAll({
          where: {
            dateTime: {
              //[Op.gt]: new Date().setMinutes(new Date().getMinutes() - 30),
              [Op.gt]: moment(),
            },
          },
          order: [
            ['dateTime', 'ASC'],
            ['id', 'ASC'],
          ],
          raw: true,
          include: 'vtuber',
        });
        return scheduleEmbed(data, null, null);
      } else {
        const vtuberFirstName = args[0].toLowerCase();
        const vData = await Vtuber.findOne({
          where: { name: vtuberFirstName },
        });
        if (!vData) {
          throw {
            message: `Kamu menginput ${vtuberFirstName} dan itu tidak ada di database kami`,
          };
        }
        const data = await Schedule.findAll({
          where: {
            dateTime: {
              [Op.gt]: new Date().setMinutes(new Date().getMinutes() - 30),
            },
            vtuberID: vData.id,
          },
          order: [
            ['dateTime', 'ASC'],
            ['id', 'ASC'],
          ],
          raw: true,
          include: 'vtuber',
        });
        return scheduleEmbed(data, vData.fullName, vData.avatarURL);
      }
    } catch (e) {
      return message.reply(
        `Ada sesuatu yang salah, tapi itu bukan kamu: ${e.message}`
      );
    }
  },
};
