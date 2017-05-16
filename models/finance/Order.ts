export enum OrderType {
  buy,
  sell,
  hold,
};

class Order {
  private _type: OrderType;
  private _symbol: string;
  private _price: number;
  private _amount: number;
  private _date: string;

  get symbol(): string {
    return this._symbol;
  }

  get type(): OrderType {
    return this._type;
  }

  get date(): string {
    return this._date;
  }

  get price(): number {
    return this._price;
  }

  get amount(): number {
    return this._amount;
  }

  get fee(): number {
    return Order.calculateFee(this.type, this.symbol, this.price, this.amount);
  }

  static calculateFee(type: OrderType, symbol: string, price: number, amount: number) {
    let fee = 0;
    const money = price * amount;

    if (type === OrderType.sell) {
      fee = fee + money * 0.001; // 印花税，仅卖方支出
    }

    if (/^sh/.test(symbol)) {
      fee = fee + amount * 0.001; // 过户费，仅上证交易
    }

    fee = fee + money * 0.0006; // 招商证券佣金万6

    return +fee.toFixed(3);
  }

  get money(): number {
    return +(this._price * this._amount).toFixed(3);
  }

  get cost(): number {
    if (this._type === OrderType.buy) {
      return +(this.money + this.fee).toFixed(3);
    }

    return 0;
  }

  get earnings(): number {
    if (this._type === OrderType.sell) {
      return +(this.money - this.fee).toFixed(3);
    }

    return 0;
  }

  public valueOf(): Object {
    return {
      type: this._type,
      date: this._date,
      symbol: this._symbol,
      price: this._price,
      amount: this._amount,
    };
  }

  constructor(
    type: OrderType,
    symbol: string,
    price: number,
    amount: number,
    date: string
   ) {
    this._type = type;
    this._symbol = symbol;
    this._price = price;
    this._amount = amount;
    this._date = date;
  }
}

export default Order;
