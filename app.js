//index.js code for integrating Google Calendar

const express = require('express');
const morgan = require('morgan');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

const userRouter = require('./routes/userRoutes');
const calendarRouter = require('./routes/calendarRoutes');

const app = express();

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json());

const missionaryCalendars = {
  'Arslanian.Zachary':
    '51f60e4c016761ead03ec9b5f6d2993235dae9ad5ba529f3195fe2e6750c084d@group.calendar.google.com',
  'Beesley.Austin':
    'bc8cb8200e57cd315b907238716b6c5ad4eee03841abfc80d7affaec74f6d43b@group.calendar.google.com',
  'Beatty.Lincoln':
    '29ee52dfe60b5da3aea4c43ae18ea2560d0c15cbe91478c70667ef71fb723900@group.calendar.google.com',
  'Bistline.Shami':
    'd191f1e524a9c9e0986b752991ded8c79331db7ca185bf36e29bc827e9da177d@group.calendar.google.com',
  'Burgess.Conner':
    '491591ae38107ffebe984b4b50d425cea7367eade39f9f61396aa3c02435af03@group.calendar.google.com',
  'Christensen.Westin':
    '166367c3dcd553d9064082667b67b8c2f3bb93858c1fbfda3d1244523f6ba0e4@group.calendar.google.com',
  'Cunningham.Emmitt': 'v7f8l57nf8r2hh82ttu8jjprd0@group.calendar.google.com',
  'Cutchen.Brennan':
    '8f95b8db3055de7ffa721946eb591221a12825f04c623436843157fd84768638@group.calendar.google.com',
  'Douglas.Porter':
    '6e8ac184c18016bd7f77556a39c46f0cb6026e3a35dc2e935c4672996cf1873e@group.calendar.google.com',
  'Florian.Antoine': 'v7f8l57nf8r2hh82ttu8jjprd0@group.calendar.google.com',
  'Ford.Anna':
    '629798f1f33420dd1b4535219096c5c5ce325a6988ff3014770342a4e88bc5c6@group.calendar.google.com',
  'Gibson.Riley': 'nq8r2jcptfhp4df16ihd291ang@group.calendar.google.com',
  'Graves.Brayden': '2hi12uairof1cik8u4frkd6ptc@group.calendar.google.com',
  'Griffith.Aiden': 'vf9taesjs5erludk41kv9g8al0@group.calendar.google.com',
  'Hall.Steven': 'k2eg344231994oflqcud7vbqug@group.calendar.google.com',
  'Hunt.Bryston':
    '5ba6b688976edb70699c7f74b012b54382173d06d6a4332b6bf01c42eb8e3abc@group.calendar.google.com',
  'Hunt.Kaylor':
    '60f1ddb2ff3e53f84e2267d3d0e43319e2d7efa5350d240e464f4447511d5996@group.calendar.google.com',
  'Isom.Savannah':
    '112dc53eb355c420347ab5b6b73699e5143fb1bebd7a68fc7054993febe748ef@group.calendar.google.com',
  'Jensen.Sarah':
    'ffe4e35134d2fee6d032ec06b3026dcf017a0e02915604a70cc60d74cd7a2125@group.calendar.google.com',
  'Jones.Jaxson':
    '4fa75513d66719a0e01f436fd7f331a9a79c1b1fa286b0c3f06194425e8f3aae@group.calendar.google.com',
  'Kaba.Kai':
    '153de9ff2a7cf4bbb335dec1a6e221f8cd8a382014b08e7275bd76ac5922bfb2@group.calendar.google.com',
  'Keith.Cameron':
    'f3aae76dc7dd17586d6c5dfc935c2d195cf27fe596c08dd60442134fbb488357@group.calendar.google.com',
  'Kennedy.Ira':
    '8d5ae488d037be8d7cd4ad5f0754bd544458bc9ba35d782dd6db9679b94a6024@group.calendar.google.com',
  'Kenworthy.Ellie':
    'a07bdd623780b2e0ca678a5801897320dad73dedb83f14c94e88fbc336c15587@group.calendar.google.com',
  'Kyle.Joshua': 'kupuumaujr1tc39ktiqpra51fs@group.calendar.google.com',
  'Lawrence.Trey':
    '12231a80e1e5aae1816718937ddeb25558fbab8152659b42706ca5fb6510b12b@group.calendar.google.com',
  'Lindsey.Taylor':
    '266cf58a179f7beb982b84c43586c9a17d468c10d85fbd750128e62587363090@group.calendar.google.com',
  'Lockhart.Alyson': 'nq1p7rall4nqad9n3atr8m3m0c@group.calendar.google.com',
  'Nelson.Avrian':
    '71211676435aa8ba175acda981d0f448ffff5952cd8d6fd6e80d71ffd4d0c453@group.calendar.google.com',
  'Nielsen.Anaya':
    '205a2ee494060d449208a30b288971a17595f35a7ba1299c1d74893eca0c2527@group.calendar.google.com',
  'Pender.Sean':
    'd083228971a5eeab23d1d0caed9a6435f1ebca6469bdf53cc1c4188d4acb5e41@group.calendar.google.com',
  'Reeve.Ruger':
    '8df365a0dea8123d9b8e0f0ae1ef977f286527e10ec0eed76b9cc9ad84556e28@group.calendar.google.com',
  'Robinson.Reagan':
    '65b12ed59f92bbcbdd78a9004ca15420e11e54ef9463dec4a589c428357d7706@group.calendar.google.com',
  'Rogers.Caleb':
    'c2188fa850746e45136127ad701ca47f48ad1f566c25605fcb8ef0d0beb2aa1e@group.calendar.google.com',
  'Smith.Conrad': 'hurvphu4rm9ef49bnfrd1gp1pk@group.calendar.google.com',
  'Smith.Hanna':
    '3658ef63ad1d6c068634ca320adc4dcd4a3c150f7fc85a8e187957ba6c9e68fb@group.calendar.google.com',
  'Sylvain.Cody':
    '9ffe557158d4df63912340deec008f2157846506dd93517e71e1dee4013e61e9@group.calendar.google.com',
  'Wait.Camille':
    '7af84ee54d6039dd90d2539a5d7f76310f9e52ac82d4305de8568e7a939287e9@group.calendar.google.com',
  'Williams.Jayden':
    'acf04b182987d5ce93dacf20e373cf9adbce1fa942f5f18cb9c21e23d4cb2778@group.calendar.google.com',
  'Bulkley.Gavin': '06oi80hikq06uou0maa130veu8@group.calendar.google.com',
  'Turner.Saige': '666pavcjff1ds8lq45h4nec2s0@group.calendar.google.com',
  'Shaner.Alley': 'n3b2jkk04nsl3ajh9p8t57s2q8@group.calendar.google.com',
  'Coombs.Haley':
    'ac0618527fec99320bd2f99e6a03d34949b88ea2850077a01f0bb1d4f8683d05@group.calendar.google.com',
  'Wilson.Dalton': '6kbgrd7nfk9n9sn5c4p3p28ckg@group.calendar.google.com',
  'Griffith.Kason': 'vl1uj9nu4rb4nchcvcf3qoo770@group.calendar.google.com',
  'Jones.Victoria': 't1l24usdci92rk7ksv351tekv0@group.calendar.google.com',
  'Kershaw.Khadron': '6li94pf9k8fqe1dvmkbv6oad2k@group.calendar.google.com',
  'Vranes.Bridger':
    '531bd7d125f52c692003edbdbbd4baaf05cac0c3eda3d9b5f6845648635c940e@group.calendar.google.com',
  'Jaxson.Cleverly':
    '665f702e3676d4cc9683c5d9d5730c5490369f50150448f7e6a71aa095f11224@group.calendar.google.com',
  'Jaussi.William':
    '3cb4420274f9a949713040f1f84b19f871ca99cf448caa352dca31d0a76b67b2@group.calendar.google.com',
  'Ghica.Gary':
    '9994a0577abbda3d270de23933be59fb3e6871d52e37cae6416fad5f8ca797fb@group.calendar.google.com',
  'Hansgen.Bridger':
    '43b343c0575f6e3797064d42abcf8db9e54b9d9632f60fcea8ca0e015f1900f1@group.calendar.google.com',
  'Maloy.Anna':
    'd4c6bead2f617deffaf1e0d525fde8e6aa3d570c5658dc6b0c2a6cd684709770@group.calendar.google.com',
  'Meidell.Emma':
    'e6872f40b32343e6b4cab1359c9a3a2b8b2d82750608531b9dc9cd3aa682d489@group.calendar.google.com',
  'Hirschi.Rhett':
    'c2ca0006dd620ffe612eed5815b8a794bf43a7bb253497793a97b47ea18bcfc2@group.calendar.google.com',
  'Cummings.Charles':
    'a955213ccdb4be7afc8d46c81dc543bb673c8d6b0e50e7e2a2f6151a9268761d@group.calendar.google.com',
  'Parry.Eric':
    '85ef219a5a1a9c89708ba6af5dadab3aed1b75247445f2f469347cd93cedebff@group.calendar.google.com',
  'Ulrich.Connelly':
    '5bf1a363f5ec2f60ed7f467d3e477459ef7b4ef5d2dcdb4ca45783e438038ca2@group.calendar.google.com',
};

const sitesCalendars = {
  'Family Search Center':
    '75b9d30b6b0cec6a0520f6d14ebbd6471c89843ac3d16f30fccfac0070f6893c@group.calendar.google.com',
  ROC: '8a99c1fead30e610aae0f02b8f54dcd170ed2b045911c700799725aec774ad25@group.calendar.google.com',
};

const districtsCalendars = {
  'Saint George South District':
    'db0d6158cbb2ed33229ba1fafa458dd60275d644c6cb25e08642c351794d44e6@group.calendar.google.com',
};

const zonesCalendars = {
  'Saint George Zone':
    '8ff1bcceb35c8742d9cd320da2f8a41bc9e10c7a63cffaf5d6b55ad81f337abe@group.calendar.google.com',
};

const { google } = require('googleapis');
const { OAuth2 } = google.auth;
const oAuth2Client = new OAuth2(
  '933929627925-m6tpcp0pe9an96roko74618efkgrt1nn.apps.googleusercontent.com',
  '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'
);

oAuth2Client.setCredentials({
  refresh_token:
    '1//04BPmiCS6VomlCgYIARAAGAQSNwF-L9IrOXD5gQnB7O4qA404_iRWL7hTXuThhnwSwRWS53sMj2orCeWhBofsiQgN812p9og3A0Y',
});

/*
const calendarData = [];


const calendar = google.calendar({version: 'v3', auth: oAuth2Client});

async function getCalendarData() {
  Object.values(missionaryCalendars).forEach(function (calendarId) {
    calendar.events.list({
      calendarId: calendarId,
      timeMin: (new Date()).toISOString(),
      maxResults: 100,
      singleEvents: true,
      orderBy: 'startTime',
    }, (error, result) => {
      if (error) {
        console.log(error);
      } else {
        calendarData.push(result);
      }
    });
  });
}


calendar.events.list({
  calendarId: 'antoinemflorian@gmail.com',
  timeMin: (new Date()).toISOString(),
  maxResults: 100,
  singleEvents: true,
  orderBy: 'startTime',
}, (error, result) => {
  if (error) {
    console.log(error);
  } else {
    console.log(result.data.items);
  }
});
*/

app.use('/api/v1/users', userRouter);
app.use('/api/v1/calendars', calendarRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
