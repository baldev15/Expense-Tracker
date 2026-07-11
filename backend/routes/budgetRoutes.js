import express from 'express';
import {
  getBudgets,
  addOrUpdateBudget,
  deleteBudget,
} from '../controllers/budgetController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getBudgets)
  .post(addOrUpdateBudget);

router.route('/:id')
  .delete(deleteBudget);

export default router;
