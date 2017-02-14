'use strict';

const express = require('express.co');
const app = express();
const moment = require('moment');
const trending = require('trending-github');
const axios = require('axios');
const endpoint = 'https://api.github.com/repos/ophobe/trending/contents/';
const languages = require('./languages');
require('dotenv').config();

app.use(function (req, res, next) {
  if (languages.includes(req.originalUrl.replace(/\//g, ''))) {
    return next();
  }

  res.json({error: 'Invalid endpoint'});
});

app.get('/:language?', function*(req, res) {
  const language = req.params.language || 'all';
  const repos = yield trending('daily', language).then(response => response);
  const content = new Buffer(JSON.stringify({repositories: repos}, null, 2)).toString('base64');
  const today = moment().format('DD-MM-YYYY');
  
  if (process.env.commit !== 'false') {
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
  }

  res.json(repos);
});

app.listen(3000, () => console.log('Application running on http://localhost:3000'));