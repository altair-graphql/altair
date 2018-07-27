'use strict';

let fs = require('fs');
let path = require('path');
let express = require('express');
let cookieParser = require('cookie-parser');
let bodyParser = require('body-parser');

let app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', (req, res) => {
  let appHtml = fs.readFileSync(path.join(__dirname, 'dist/index.html'), 'utf8');
  const crowdinScriptTags = `
  <script type="text/javascript">
    var _jipt = [];
    _jipt.push(['project', 'altair-gql']);
  </script>
  <script type="text/javascript" src="//cdn.crowdin.com/jipt/jipt.js"></script>
  `;
  const translationFlagTag = `<script>window.__ALTAIR_TRANSLATE__ = 1;</script>`;

  if (process.argv[2] === '--translate') {
    appHtml = appHtml.replace('</head>', `${crowdinScriptTags}</head>`);
    appHtml = appHtml.replace('</head>', `${translationFlagTag}</head>`);
  }
  res.send(appHtml);
});

app.use(express.static(path.join(__dirname, 'dist')));

const forceSSL = function() {
  return function (req, res, next) {
    if (req.headers['x-forwarded-proto'] !== 'https') {
      return res.redirect(
       ['https://', req.get('Host'), req.url].join('')
      );
    }
    next();
  }
}
// Instruct the app
// to use the forceSSL
// middleware
app.use(forceSSL());

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/index.html'));
});

let port = process.env.PORT || 8081;
let server = app.listen(port, () => {
	console.log('Server is now running.', port);
});

module.exports = server;