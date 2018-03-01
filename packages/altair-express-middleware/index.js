import express from 'express';
import path from 'path';

module.exports = {
  altairExpress: (opts) => {
    const app = express();

    app.use(express.static(path.join(__dirname, 'dist')));

    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist/index.html'));
    });

    return app;
  }
};
