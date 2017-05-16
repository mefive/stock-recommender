import express = require('express');
import * as service from '../utils/service';
import Trader from '../models/trader/BacktestTrader';
import MovingAverageCrossover from '../models/strategy/MovingAverageCrossover';
import { percentString } from '../utils/number';
import findLast = require('lodash/findLast');

const router = express.Router();

router.get('/api/backtest', async function (req, res, next) {
  const { symbol, datalen = 100, scale = 240  } = req.query;

  const reverse = !!(+req.query.reverse);
  const trades = [];

  try {
    if (!symbol) {
      throw 'symbol must be provided';
    }

    const data = await service.get(
      'http://money.finance.sina.com.cn/quotes_service/api/json_v2.php/CN_MarketData.getKLineData',
      {
        symbol,
        scale,
        datalen,
      }
    );

    const trader: Trader = new Trader(
      100000,
      (symbol, date) => {
        const order = trader.orders.slice(-1)[0];
        const { portfolio } = trader;

        trades.push({ order: order.valueOf(), portfolio: portfolio.valueOf() });

        if (date === '2017-04-12') {
          console.log(portfolio.returns)
        }

        console.log(
          `${date}
买入 价格：${order.price} 数量：${order.amount} 支出：${order.cost.toFixed(3)}
仓位 总资产：${portfolio.asset.toFixed(3)} 现金：${portfolio.cash.toFixed(3)} 总收益：${percentString(portfolio.returns)}
          `
        );
      },

      (symbol, date) => {
        const order = trader.orders.slice(-1)[0];
        const { portfolio } = trader;

        trades.push({ order: order.valueOf(), portfolio: portfolio.valueOf() });

        console.log(
          `${date}
卖出 价格：${order.price} 数量：${order.amount} 支出：${order.cost.toFixed(3)}
仓位 总资产：${portfolio.asset.toFixed(3)} 现金：${portfolio.cash.toFixed(3)} 总收益：${percentString(portfolio.returns)}
          `
        );
      },

      (symbol, date) => {
        const order = trader.orders.slice(-1)[0];
        const { portfolio } = trader;

        trades.push({ order: order.valueOf(), portfolio: portfolio.valueOf() });

        console.log(
          `${date}
持仓点更新 价格：${order.price} 数量：${order.amount} 支出：${order.cost.toFixed(3)}
仓位 总资产：${portfolio.asset.toFixed(3)} 现金：${portfolio.cash.toFixed(3)} 总收益：${percentString(portfolio.returns)}
          `
        );
      }
    );
    const strategy = new MovingAverageCrossover(trader);

    const short = data.map(i => i.maPrice5);
    const mid = data.map(i => i.maPrice10);
    const long = data.map(i => i.maPrice30);

    console.log(`


股票代号 ${symbol}
    `)

    console.log(`==== 交易历史 ====
    `);

    data.forEach((tick, index) => {
      if (index < 2) {
        return true;
      }

      trader.portfolio.tick(symbol, tick.open);

      strategy.run(
        symbol,
        short.slice(0, index),
        mid.slice(0, index),
        long.slice(0, index),
        tick.open,
        tick.day
      );
    });

    console.log(`==== 最终状态 ====
    `);

    const { portfolio } = trader;

    console.log(`仓位 总资产：${portfolio.asset.toFixed(3)} 现金：${portfolio.cash.toFixed(3)} 总收益：${percentString(portfolio.returns)}`)

    res.json({
      code: 0,
      data: {
        kline: data,
        trades,
        portfolio: portfolio.valueOf(),
      }
    });
  }
  catch (e) {
    next(e);
  }
});

export default router;
