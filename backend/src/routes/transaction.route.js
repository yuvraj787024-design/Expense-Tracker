const express = require("express");
const router = express.Router();

// ✅ correct imports
const { authMiddleware } = require('../middlewares/auth.middleware');

const {
    transaction,
    update,
    getDashboard,
    deleteExpense,
    updateBudget
} = require('../controllers/transaction.controller');


// ✅ Routes
router.post('/transaction', authMiddleware, transaction);

router.patch('/update/:id', authMiddleware, update);
router.patch("/budget", authMiddleware, updateBudget)

router.get('/dashboard', authMiddleware, getDashboard);

router.delete('/delete/:id', authMiddleware, deleteExpense);

module.exports = router;