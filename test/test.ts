import Portfolio from '../models/finance/Portfolio';
import Order, { OrderType } from '../models/finance/Order';
import Trader from '../models/trader/BacktestTrader';
import Strategy from '../models/strategy/MovingAverageCrossover';

export function run() {
  // testPortfolio();
  // testOrder();
  // testTrader();
 //  testStragegy();
}

const symbol = 'sh60003';

function testPortfolio() {
  const portfolio = new Portfolio(5000);

  portfolio.tick(symbol, 20);

  console.log('position', portfolio.findPositionBySymbol(symbol));

  portfolio.buy(symbol, 10, 201);

  console.log('portfolio after buy', portfolio);

  portfolio.sell(symbol, 10, 300);

  console.log('portfolio after sell', portfolio);
}

function testOrder() {
  let order = new Order(OrderType.buy, symbol, 100, 100, '2017-01-01');

  console.log('order money after buy', order.money);

  order = new Order(OrderType.sell, symbol, 100, 100, '2017-01-01');

  console.log('order earings after sell', order.fee, order.earnings);
}

function testTrader() {
  let trader = new Trader(10000);
  const { portfolio } = trader;

  const price = 20;

  portfolio.tick(symbol, price);

  trader.buy(symbol, price, 100, '2017-01-01');

  portfolio.tick(symbol, price + 20);

  console.log('returns', trader.calculateReturns(symbol));

  trader.sell(symbol, price + 25, 100, '2017-01-01');
}

// function testStragegy() {
//   const trader = new Trader(10000);

//   const strategy = new Strategy(trader);

//   trader.portfolio.tick(symbol, 20);

//   strategy.run(symbol, [18, 25], [20, 20], 20, '2017-01-01');

//   trader.portfolio.tick(symbol, 25);

//   strategy.run(symbol, [30, 25], [25, 25], 20, '2017-01-01');

//   console.log('asset', trader.portfolio.asset);
//   console.log('returns', `${(trader.portfolio.returns * 100).toFixed(2)}%`);
// }