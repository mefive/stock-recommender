import * as express from 'express';
import * as moment from 'moment';
import * as service from '../utils/service';

const router = express.Router();

router.get('/api/cutLoss', async (req, res, next) => {
  const {
    symbol, days = 20, start = moment().subtract(-20).format('YYYY-MM-DD'),
  } = req.query;

  const durationDays = moment.duration(moment() - moment(start)).asDays();

  const datalen = Math.ceil(
    Math.max(days, durationDays)
  );

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


    if (durationDays > days) {
      const startIndex = data.findIndex(({ day }) => moment(day) >= moment(start));
      data = data.slice(startIndex, data.length);
    }

    // const HIGH_PROP = 'close';
    const HIGH_PROP = 'high';

    const highest = Math.max.apply(this, data.map(d => d[HIGH_PROP]));

    data = data.slice(-days);

    console.log(data, data.map(d => d.high - d.low).reduce((p, c) => p + c, 0) / days);

    // 计算 ATR 规则如下
    // TR=∣最高价-最低价∣和∣最高价-昨收∣和∣昨收-最低价∣的最大值
    // 真实波幅（ATR）= TR 的 N 日简单移动平均
    const sumTRs = data.reduce(
      (prev, current, index) =>
        Math.max(
          current.high - current.low,
          data[index - 1] ? Math.abs(current.high - data[index -1].close) : 0,
          data[index - 1] ? Math.abs(current.low - data[index -1].close) : 0,
        ) + prev,
      0,
    );

    const ATR = sumTRs / days;

    res.json({
      code: 0,
      data: {
        ATR,
        price: ATR * 2,
        highest,
        cutLoss: highest - ATR * 2,
      }
    });
  } catch (e) {
    next(e);
  }
});

export default router;
