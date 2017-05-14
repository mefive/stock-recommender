import express = require('express');
import backtestController from './controller/backtest';

const PORT = 7777;

function start() {
  const app = express();

  app.use(backtestController);

  app.use((err, req, res, next) => {
    console.log(err);
    res.status(500).send(err);
  });

  app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
}

start();

// import { run as runTest } from './test/test';

// runTest();