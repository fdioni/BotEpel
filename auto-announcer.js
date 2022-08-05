const express = require('express')
const bodyParser = require('body-parser')
const xml2js = require('xml2js')
const moment = require('moment')

const liveChannel = require('./main.js');

const router = express.Router()

const { name : app_name, version: app_version } = require('./package.json');
const { roles, textChannelID, prefix } = require('./config.js');
const { youtube } = require('./config/youtube');
const Vtuber = require('./models').Vtuber;
const Schedule = require('./models').Schedule;

const xmlParser = new xml2js.Parser({ explicitArray: false })

router.use(function(req, res, next) {
    console.log('Connection to the API..');
    next();
});

router.use(bodyParser.text({ type: 'application/atom+xml' }))

router.get('/video', function (req, res) {
    res.status(200).send(req.query['hub.challenge'])
})

router.post('/video', (req, res) => {

    moment.locale('id');
    const timeFormat = 'Do MMMM YYYY, HH:mm';
    const timeForDB = 'MM DD YYYY, HH:mm';

    console.log("New Push Notification incoming!")

    xmlParser.parseString(req.body, async(error, result) => {
        if(error) {
            //res.status(422).json({ code: 'xml_parse_error', details: "Something went wrong while parsing the XML", error }) 
            console.log("Something went wrong while parsing the XML" . error)     
        } else {
            console.log("Success parsing the XML")
            let vid = result.feed.entry
            let publishUpdateDifference = moment.duration(moment(vid.updated).diff(vid.published)).asSeconds()
            let type = (publishUpdateDifference > 300) ? 'updated' : 'published'

            const config = {
                id: "GOwpicCOe6k",
                part: 'snippet,liveStreamingDetails',
                fields: 'pageInfo,items(snippet(title,thumbnails/high/url,channelTitle,channelId),liveStreamingDetails)',
            };
            //const youtubeData = await youtube.videos.list(config);
            const youtubeData = await youtube.videos.list(config);
            const youtubeInfo = youtubeData.data.items[0].snippet;
            const youtubeLive = youtubeData.data.items[0].liveStreamingDetails;

            //console.log(youtubeInfo);
            //console.log(youtubeLive);

            const vData = await Vtuber.findOne({
                where: {
                    channelURL: `https://www.youtube.com/channel/${youtubeInfo.channelId}`,
                },
            });

            if(vData)
            {
                const videoDateTime = moment(youtubeLive.scheduledStartTime).utcOffset('+07:00');

                const liveEmbed = {
                    color: parseInt(vData.dataValues.color),
                    title: `${vData.dataValues.fullName} akan ${ !youtubeLive ? 'mengupload video baru' : 'melakukan Livestream' }!`,
                    author: {
                    name: vData.dataValues.fullName,
                    icon_url: vData.dataValues.avatarURL,
                    url: vData.dataValues.channelURL,
                    },
                    thumbnail: {
                    url: vData.dataValues.avatarURL,
                    },
                    fields: [
                    {
                        name: "Tanggal & Waktu Live:" ,
                        value: `${videoDateTime.format(timeFormat)} UTC+7 / WIB`,
                    },
                    {
                        name: 'Link Video Youtube',
                        value: `https://www.youtube.com/watch?v=${vid.videoId}`,
                    },
                    {
                        name: "Judul Live: ",
                        value: youtubeInfo.title,
                    },
                    ],
                    image: {
                    url: youtubeInfo.thumbnails.high.url,
                    },
                    footer: {
                    text: `${app_name} v${app_version} - This message was created on ${moment()
                        .utcOffset('+07:00')
                        .format(timeFormat)}`,
                    },
                };

                let mention = '';

                if (vData.dataValues.fanName || vData.dataValues.fanName === '') {
                    const roleId = "";
                    if (roleId) {
                        mention = `<@&${roleId.id}>`;
                    } else {
                        mention = '@here';
                    }
                } else {
                    mention = '@here';
                }

                //const channel = message.guild.channels.cache.get(textChannelID.live);
                //const channel = client.channels.get(textChannelID.live);

                console.log("data:" + textChannelID.live);

                //const sData = await Schedule.findOne({
                const sData = await Schedule.findOne({
                    where: {
                        youtubeUrl: `https://www.youtube.com/watch?v=${vid.videoId}`,
                    },
                });

                if (!sData) {
                    //await Schedule.create({
                    await Schedule.create({
                        title: youtubeInfo.title,
                        youtubeUrl: `https://www.youtube.com/watch?v=${vid.videoId}`,
                        dateTime: new Date(videoDateTime.format(timeForDB)),
                        vtuberId: vData.dataValues.id,
                        type: "live",
                        thumbnailUrl: youtubeInfo.thumbnails.high.url,
                    });
                }
                
                //const channel = liveChannel.channels.cache.get(config.textChannelID.live);

                //await channel.send({
                await liveChannel.send({
                    content: `Hai Halo~ ${mention} people ヾ(＾-＾)ノ \n${
                    "live" === 'live'
                        ? `Bakal ada Livestream mendatang lhoooo pada **${videoDateTime.format(
                            timeFormat
                        )} WIB!**\nDateng yaaa~ UwU`
                        : `Akan ada premiere lhooo~ pada **${videoDateTime.format(
                            timeFormat
                        )} WIB!**\nNonton bareng yuk~!`
                    }`,
                    embeds: [liveEmbed],
                });
            }
        }
    })

    res.status(200).send(req.query['hub.challenge'])
})

module.exports = router ;