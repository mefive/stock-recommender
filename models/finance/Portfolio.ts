import Position from './Position';

class Portfolio {
  private _startingCash: number;
  private _cash: number;
  private _positions: { [key: string]: Position };

  get cash(): number {
    return this._cash;
  }

  get asset(): number {
    let total = this._cash;

    Object.keys(this._positions).map((key) => {
      const position = this._positions[key];
      total += (position.amount * position.price);
    });

    return total;
  }

  get returns(): number {
    return (this.asset - this._startingCash) / this._startingCash;
  }

  public buy(symbol: string, amount: number, cost: number) {
    const position: Position = this.getPosition(symbol);
    position.amount += amount;
    this._cash -= cost; 
  }

  public sell(symbol: string, amount: number, earnings: number) {
    const position: Position = this.getPosition(symbol);
    position.amount -= amount;
    this._cash += earnings;
  }

  public tick(symbol: string, price: number) {
    const position = this.getPosition(symbol);
    position.price = price;
  }

  public findPositionBySymbol(symbol: string) {
    return this._positions[symbol];
  }

  private getPosition(symbol: string): Position {
    if (symbol in this._positions) {
      return this._positions[symbol];
    }

    const position: Position = new Position(symbol);
    this._positions[symbol] = position;

    return position;
  }

  public valueOf(): Object {
    return {
      asset: this.asset,
      cash: this._cash,
      returns: this.returns,
    };
  }

  constructor(cash: number) {
    this._startingCash = cash;
    this._cash = cash;

    this._positions = {};
  }
}

export default Portfolio;
