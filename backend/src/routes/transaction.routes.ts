// src/routes/transaction.routes.ts
import { Router } from 'express';
import { TransactionController } from '@/controllers/transaction.controller';
import { authenticate } from '@/middleware/auth';
import { validate } from '@/middleware/validate';
import { body } from 'express-validator';

const router = Router();
const transactionController = new TransactionController();

router.use(authenticate);

// Validation rules
const transactionValidation = [
  body('amount').isNumeric().withMessage('Amount must be a number'),
  body('type').isIn(['income', 'expense', 'transfer', 'investment', 'saving']),
  body('category').notEmpty(),
  body('description').notEmpty().trim(),
  body('date').optional().isISO8601(),
  body('mpesaCode').optional().isString(),
  body('goalId').optional().isMongoId(),
  body('budgetId').optional().isMongoId()
];

// Routes
router.get('/', transactionController.getTransactions);
router.get('/summary', transactionController.getSummary);
router.get('/trends', transactionController.getTrends);
router.get('/categories', transactionController.getSpendingByCategory);
router.get('/recurring', transactionController.getRecurring);
router.get('/upcoming', transactionController.getUpcoming);
router.get('/search', transactionController.search);
router.get('/duplicates', transactionController.getDuplicates);
router.get('/export', transactionController.exportTransactions);
router.get('/:id', transactionController.getTransactionById);

router.post('/', transactionValidation, validate, transactionController.createTransaction);
router.post('/bulk', transactionController.bulkCreate);

router.put('/:id', transactionValidation, validate, transactionController.updateTransaction);
router.put('/:id/merge', transactionController.mergeDuplicates);

router.delete('/:id', transactionController.deleteTransaction);

export default router;
