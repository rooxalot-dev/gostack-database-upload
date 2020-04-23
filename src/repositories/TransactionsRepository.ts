import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const transactions = await this.find();

    const income = this.getTypeSum(transactions, 'income');
    const outcome = this.getTypeSum(transactions, 'outcome');
    const total = income - outcome;

    const balance = { income, outcome, total } as Balance;

    return balance;
  }

  private getTypeSum(
    transactions: Transaction[],
    type: 'income' | 'outcome',
  ): number {
    const typeSum = transactions
      .filter(transaction => transaction.type === type)
      .map(transaction => transaction.value)
      .reduce((p, c) => {
        return p + c;
      }, 0);

    return typeSum;
  }
}

export default TransactionsRepository;
