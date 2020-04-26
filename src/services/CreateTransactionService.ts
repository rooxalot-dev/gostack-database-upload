// import AppError from '../errors/AppError';

import { Repository, getRepository, getCustomRepository } from 'typeorm';
import Transaction from '../models/Transaction';
import TransactionsRepository from '../repositories/TransactionsRepository';
import Category from '../models/Category';
import AppError from '../errors/AppError';

interface CreateTransactionRequest {
  title: string;
  value: number;
  type: string;
  category: string;
}

class CreateTransactionService {
  private transactionsRepository: TransactionsRepository;

  private categoriesRepository: Repository<Category>;

  constructor() {
    this.transactionsRepository = getCustomRepository(TransactionsRepository);
    this.categoriesRepository = getRepository<Category>(Category);
  }

  public async execute({
    title,
    value,
    type,
    category,
  }: CreateTransactionRequest): Promise<Transaction> {
    if (type !== 'income' && type !== 'outcome') {
      throw new AppError('Invalid transaction type.');
    }

    const currentBalance = await this.transactionsRepository.getBalance();

    if (type === 'outcome' && currentBalance.total < value) {
      throw new AppError(
        'Your current balance is not enough for this operation.',
      );
    }

    let existingCategory = await this.categoriesRepository.findOne({
      where: { title: category },
    });

    if (!existingCategory) {
      const createdCategory = this.categoriesRepository.create({
        title: category,
      });
      existingCategory = await this.categoriesRepository.save(createdCategory);
    }

    const validType: 'income' | 'outcome' = type;

    const transaction = this.transactionsRepository.create({
      title,
      value,
      type: validType,
      category_id: existingCategory.id,
    });

    const newTransaction = this.transactionsRepository.save(transaction);
    return newTransaction;
  }
}

export default CreateTransactionService;
