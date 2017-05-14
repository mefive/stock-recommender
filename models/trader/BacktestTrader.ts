import { ITrader } from './index';
import Order, { OrderType } from '../finance/Order';
import Position from '../finance/Position';
import Portfolio from '../finance/Portfolio';
import findLast = require('lodash/findLast');

class BacktestTrader implements ITrader {
  private _portfolio: Portfolio;
  private _orders: Order[];

  private _onBuy: (symbol: string, date: string) => void;
  private _onSell: (symbol: string, date: string) => void;
  private _onHold: (symbol: string, date: string) => void;

  get portfolio(): Portfolio {
    return this._portfolio;
  }

  get orders(): Order[] {
    return this._orders;
  }

  constructor(
    startingCash: number,
    onBuy: (symbol: string, date: string) => void = () => {},
    onSell: (symbol: string, date: string) => void = () => {},
    onHold: (symbol: string, date: string) => void = () => {},
  ) {
    this._portfolio = new Portfolio(startingCash);
    this._orders = [];
    this._onBuy = onBuy;
    this._onSell = onSell;
    this._onHold = onHold;
  }

  public buy(symbol: string, price: number, amount: number, date: string) {
    while (amount > 0
      && Order.calculateFee(OrderType.buy, symbol, price, amount) + (price * amount) > this._portfolio.cash
    ) {
      amount--;
    }

    const order = new Order(OrderType.buy, symbol, price, amount, date);

    this._orders.push(order);
    this._portfolio.buy(symbol, amount, order.cost);

    this._onBuy(symbol, date);
  }

  public sell(symbol: string, price: number, amount: number, date: string) {
    const order = new Order(OrderType.sell, symbol, price, amount, date);
    this._orders.push(order);
    this._portfolio.sell(symbol, amount, order.earnings);

    this._onSell(symbol, date);
  }

  public hold(symbol: string, price: number, amount: number, date: string) {
    const order = new Order(OrderType.hold, symbol, price, amount, date);
    this._orders.push(order);

    this._onHold(symbol, date);
  }

  public calculateReturns(symbol: string) {
    const position: Position = this._portfolio.findPositionBySymbol(symbol);
    const lastBuyOrder: Order
      = findLast(
        this._orders,
        (i: Order) => i.symbol === symbol
      );

    if (!position || !lastBuyOrder || lastBuyOrder.type === OrderType.sell) {
      return 0;
    }

    return (position.price - lastBuyOrder.price) / position.price;
  }
}

export default BacktestTrader;
