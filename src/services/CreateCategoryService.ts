import { Repository, getRepository } from 'typeorm';

import AppError from '../errors/AppError';
import Category from '../models/Category';

class CreateCategoryService {
  private repository: Repository<Category>;

  constructor() {
    this.repository = getRepository<Category>(Category);
  }

  public async execute(title: string): Promise<Category> {
    const existingCategory = await this.repository.findOne({
      where: { title },
    });

    if (existingCategory) {
      throw new AppError('Category name alredy exists!');
    }

    let newCategory = this.repository.create({ title });
    newCategory = await this.repository.save(newCategory);

    return newCategory;
  }
}

export default CreateCategoryService;
