import { getCustomRepository } from 'typeorm';

import AppError from '../errors/AppError';
import TransactionsRepository from '../repositories/TransactionsRepository';

class DeleteTransactionService {
  private transactionsRepository: TransactionsRepository;

  constructor() {
    this.transactionsRepository = getCustomRepository(TransactionsRepository);
  }

  public async execute(id: string): Promise<boolean> {
    const transaction = await this.transactionsRepository.findOne(id);

    if (!transaction) {
      throw new AppError('Transaction not found with the informed Id');
    }

    const deleteResult = await this.transactionsRepository.delete(id);
    if (!deleteResult.affected) {
      return false;
    }

    return deleteResult.affected > 0;
  }
}

export default DeleteTransactionService;
