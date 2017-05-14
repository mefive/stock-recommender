import Portfolio from '../finance/Portfolio';
import Order from '../finance/Order';

export interface ITrader {
  buy(symbol: string, price: number, amount: number, date: string);
  sell(symbol: string, price: number, amount: number, date: string);
  hold(symbol: string, price: number, amount: number, date: string);

  portfolio: Portfolio;
  orders: Order[];

  calculateReturns(symbol: string): number;
}
