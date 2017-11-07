/**
 * Position class
 */
class Position {
  public readonly foo: string = 'some';
  private _symbol: string;

  get value(): number {
    return +(this.price * this.amount).toFixed(3);
  }

  public price: number;
  public amount: number;

  constructor(symbol: string, price?: number, amount?: number) {
    this._symbol = symbol;
    this.price = price || 0;
    this.amount = amount || 0;
    this.foo = '1';
  }
}

export default Position;
