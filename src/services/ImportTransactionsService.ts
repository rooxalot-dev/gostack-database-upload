import { resolve } from 'path';
import { getRepository, getCustomRepository, Repository, In } from 'typeorm';
import fs from 'fs';

import csv from 'csv-parse';
import uploadConfig from '../config/upload';
import Transaction from '../models/Transaction';
import TransactionsRepository from '../repositories/TransactionsRepository';
import Category from '../models/Category';

class ImportTransactionsService {
  private transactionsRepository: TransactionsRepository;

  private categoryRepository: Repository<Category>;

  constructor() {
    this.transactionsRepository = getCustomRepository(TransactionsRepository);
    this.categoryRepository = getRepository(Category);
  }

  async execute(filename: string): Promise<ImportedTransaction[]> {
    const filePath = resolve(uploadConfig.tempDirectory, filename);

    const transactionCSVImportation = await this.loadCSV(filePath);

    const {
      transactions: importedTransactions,
      categories: importedCategories,
    } = await transactionCSVImportation;

    // Obtem e salva novas categorias importadas
    const existingCategories = await this.categoryRepository.find({
      where: {
        title: In(importedCategories.map(c => c.title)),
      },
    });

    const newCategories = importedCategories.filter(
      c => !existingCategories.map(ec => ec.title).includes(c.title),
    );

    if (newCategories.length > 0) {
      await this.categoryRepository.save(newCategories);
    }

    const allCategories = [...existingCategories, ...newCategories];

    // Obtem e salva novas transações
    const createdTransactions = importedTransactions.map(it => {
      return this.transactionsRepository.create({
        title: it.title,
        type: it.type,
        value: it.value,
        category: allCategories.find(ac => ac.title === it.category),
      });
    });

    await this.transactionsRepository.save(createdTransactions);

    return importedTransactions;
  }

  private loadCSV(filePath: string): Promise<TransactionCSVImportation> {
    const csvParser = csv({ delimiter: ',', from: 2 });

    const transactionsImportPromise = new Promise<TransactionCSVImportation>(
      (resolve, reject) => {
        const transactions = new Array<ImportedTransaction>();
        const categories = new Array<Category>();

        fs.createReadStream(filePath)
          .pipe(csvParser)
          .on('data', csvrow => {
            const [title, type, value, category] = csvrow;

            const readTransaction: ImportedTransaction = {
              title,
              type,
              value,
              category,
            };

            if (!categories.some(c => c.title === category)) {
              const createdCategory = this.categoryRepository.create({
                title: category,
              });
              categories.push(createdCategory);
            }

            transactions.push(readTransaction);
          })
          .on('end', () => {
            fs.unlinkSync(filePath);

            resolve({
              transactions,
              categories,
            });
          })
          .on('error', () => {
            reject();
          });
      },
    );

    return transactionsImportPromise;
  }
}

interface ImportedTransaction {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

interface TransactionCSVImportation {
  transactions: Array<ImportedTransaction>;
  categories: Array<Category>;
}

export default ImportTransactionsService;
