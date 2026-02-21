// src/routes/goal.routes.ts
import { Router } from 'express';
import { GoalController } from '@/controllers/goal.controller';
import { authenticate } from '@/middleware/auth';
import { validate } from '@/middleware/validate';
import { body } from 'express-validator';

const router = Router();
const goalController = new GoalController();

router.use(authenticate);

// Validation rules
const goalValidation = [
  body('name').notEmpty().trim(),
  body('targetAmount').isNumeric().isFloat({ min: 1 }),
  body('deadline').isISO8601(),
  body('category').isIn(['savings', 'investment', 'debt', 'purchase', 'emergency', 'retirement', 'education', 'travel', 'other']),
  body('priority').optional().isIn(['low', 'medium', 'high', 'critical']),
  body('autoSave').optional().isBoolean(),
  body('autoSaveAmount').optional().isNumeric(),
  body('autoSaveFrequency').optional().isIn(['daily', 'weekly', 'biweekly', 'monthly', 'quarterly', 'yearly'])
];

// Routes
router.get('/', goalController.getGoals);
router.get('/insights', goalController.getInsights);
router.get('/recommendations', goalController.getRecommendations);
router.get('/:id', goalController.getGoalById);

router.post('/', goalValidation, validate, goalController.createGoal);
router.post('/:id/contribute', goalController.addContribution);

router.put('/:id', goalValidation, validate, goalController.updateGoal);
router.put('/:id/complete', goalController.completeGoal);
router.put('/:id/extend', goalController.extendDeadline);
router.put('/:id/adjust', goalController.adjustTarget);

router.delete('/:id', goalController.deleteGoal);

export default router;
