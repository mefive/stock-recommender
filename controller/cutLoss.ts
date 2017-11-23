import * as express from 'express';
import * as moment from 'moment';
import * as service from '../utils/service';

const router = express.Router();

router.get('/api/cutLoss', async (req, res, next) => {
  const {
    symbol, days = 20, start,
  } = req.query;

  if (!start) {
    throw 'symbol must be provided';
  }

  // fetch 20 more days to calculate ATR20
  const datalen = moment.duration(moment() - moment(start)).asDays();

  try {
    if (!symbol) {
      throw 'symbol must be provided';
    }

    let data = await service.get(
      'http://money.finance.sina.com.cn/quotes_service/api/json_v2.php/CN_MarketData.getKLineData',
      {
        symbol,
        scale: 240,
        datalen,
      },
    );

    if (data == null) {
      throw 'no data';
    }

    const HIGH_PROP = 'close';
    // const HIGH_PROP = 'high';

    const highest = Math.max.apply(this, data.map(d => d[HIGH_PROP]));

    let cutLoss = 0;

    for (let i = days - 1; i < data.length; i += 1) {
      const daysData = data.slice(i - days + 1, i + 1);
      const dayData = data[i];

      const sumTRs = daysData.reduce(
        (prev, current, index) =>
          Math.max(
            current.high - current.low,
            data[index - 1] ? Math.abs(current.high - data[index -1].close) : 0,
            data[index - 1] ? Math.abs(current.low - data[index -1].close) : 0,
          ) + prev,
        0,
      );

      const ATR = sumTRs / days;

      const dayCutLoss = dayData[HIGH_PROP] - ATR * 2;

      cutLoss = Math.max(cutLoss, dayCutLoss);
    }

    res.json({
      code: 0,
      data: {
        cutLoss,
      }
    });
  } catch (e) {
    next(e);
  }
});

export default router;
