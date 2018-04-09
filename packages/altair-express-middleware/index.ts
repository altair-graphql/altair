'use strict';

const path = require('path');
const express = require('express');

module.exports = {
  altairExpress: (opts) => {
    const app = express();

    app.use(express.static(path.join(__dirname, 'dist')));

    app.get('*', (req, res) => {
      return res.sendFile(path.join(__dirname, 'dist/index.html'));
    });

    return app;
  }
};
