import express from 'express';
import {
  getIncomes,
  addIncome,
  updateIncome,
  deleteIncome,
} from '../controllers/incomeController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect); // Protect all routes in this router

router.route('/')
  .get(getIncomes)
  .post(addIncome);

router.route('/:id')
  .put(updateIncome)
  .delete(deleteIncome);

export default router;
