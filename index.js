'use strict';

const express = require('express.co');
const app = express();
const moment = require('moment');
const trending = require('trending-github');
const axios = require('axios');
const endpoint = 'https://api.github.com/repos/ophobe/trending/contents/';
require('dotenv').config();

app.get('/favicon.ico', function *(req, res) {
  res.send('OK');
});

app.get('/:language?', function*(req, res) {
  const language = req.params.language || 'all';
  const repos = yield trending('daily', language).then(response => response);
  const content = new Buffer(JSON.stringify({repositories: repos}, null, 2)).toString('base64');
  const today = moment().format('DD-MM-YYYY');

  yield axios
    .put(`${endpoint}${language}/${today}.json`, {
      message: `${language} @ ${today}`,
      content
    }, {
      auth: {
        username: process.env.ophobe_email,
        password: process.env.ophobe_github_access_token
      }
    })
    .then(res => console.log(res))
    .catch(err => console.log(err));

  res.send(`${language} committed`);
});

app.listen(3000, () => console.log('Application running on http://localhost:3000'));