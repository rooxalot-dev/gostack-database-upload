import { Router } from 'express';
import CreateCategoryService from '../services/CreateCategoryService';

const categoriesRouter = Router();

categoriesRouter.post('/', async (request, response) => {
  const categoryService = new CreateCategoryService();
  const { title } = request.body;

  const category = await categoryService.execute(title);

  return response.status(201).json(category);
});

export default categoriesRouter;
