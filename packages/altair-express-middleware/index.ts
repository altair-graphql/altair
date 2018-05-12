'use strict';

const path = require('path');
const express = require('express');
const altairStatic = require('altair-static');

module.exports = {
  altairExpress: (opts) => {
    const app = express();

    app.get('*', (req, res) => {
      return res.send(altairStatic.renderAltair());
    });

    return app;
  }
};
