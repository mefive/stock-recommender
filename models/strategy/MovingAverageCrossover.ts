import { ITrader } from '../trader';
import findLast = require('lodash/findLast');

class MovingAverageCrossover {
  private _trader: ITrader;

  constructor(trader: ITrader) {
    this._trader = trader;
  }

  public run(
    symbol: string,
    short: number[],
    mid: number[],
    long: number[],
    price: number,
    date: string,
  ) {
    const returns = this._trader.calculateReturns(symbol);

    if (returns < -0.1) {
      this.sell(symbol, date, true);
    }

    short = short.slice(-2);
    mid = mid.slice(-2);
    long = long.slice(-2);

    const [lastShort, currShort] = short;
    const [lastMid, currMid] = mid;
    const [lastLong, currLong] = long;

    if (lastMid < lastLong && currMid >= currLong) console.log('mid crossover date', date)

    if (
      (lastShort < lastLong && currShort >= currLong
      || lastShort < lastMid && currShort >= currMid
      || lastMid < lastLong && currMid >= currLong)
      && price > currShort
    ) {
      this.buy(symbol, date);
    }
    else if (
      lastShort > lastLong && currShort <= currLong
      || lastShort > lastMid && currShort <= currMid
      || lastMid > lastLong && currMid <= currLong
    ) {
      this.sell(symbol, date);
    }
    // else if (lastMid > lastLong && currMid <= currLong) {
    //   this.sell(symbol, date, true);
    // }
  }

  public buy(symbol: string, date: string) {
    const { portfolio } = this._trader;
    const { price } = portfolio.findPositionBySymbol(symbol);
    const amount = Math.ceil(portfolio.cash / price);

    if (amount > 100) {
      this._trader.buy(symbol, price, amount, date);
    }
    // 更新金叉价格
    else {
      this._trader.hold(symbol, price, 0, date);
    }
  }

  public sell(symbol: string, date: string, cutLoss: boolean = false) {
    const { portfolio } = this._trader;
    const { amount, price } = portfolio.findPositionBySymbol(symbol);

    if (amount > 100) {
      if (cutLoss) {
        console.log('止损!!!');
        this._trader.sell(symbol, price, amount, date);
        return;
      }

      const lastOrder = findLast(this._trader.orders, order => order.symbol === symbol);

      // 价格大于上一个金叉点，继续持有
      if (price > lastOrder.price) {
        return;
      }

      this._trader.sell(symbol, price, amount, date);
    }
  }

  private noOrder() {
    console.log('no order');
  }
}

export default MovingAverageCrossover;
