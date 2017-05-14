class Position {
  private _symbol: string;

  get value(): number {
    return this.price * this.amount;
  }

  public price: number;
  public amount: number;

  constructor(symbol: string, price?: number, amount?: number) {
    this._symbol = symbol;
    this.price = price || 0;
    this.amount = amount || 0;
  }
}

export default Position;
