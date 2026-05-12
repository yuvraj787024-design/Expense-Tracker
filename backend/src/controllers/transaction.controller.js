const userModel = require('../models/auth.model')
const addExpenseModel = require('../models/transaction.model')
const jwt = require('jsonwebtoken');
const bcrypt = require("bcryptjs");

async function transaction(req,res) {
    const { expense, expenseType, expenseName} = req.body
    const transaction = await addExpenseModel.create({
        user: req.user.id ,
        expense,
        expenseType,
        expenseName,
    })
    return res.status(201).json({
        message: "Transaction added successfully",
        data: transaction,
    })
}


async function getDashboard(req, res) {
    const data = await addExpenseModel.getDashboard(req.user.id);

    res.status(200).json({
        message: "Dashboard fetched",
        data
    });
}

async function updateBudget(req,res){

    const {budget} = req.body

    const updatedUser = await userModel.findByIdAndUpdate(

        req.user.id,

        {budget},

        { returnDocument: 'after' }

    )

    res.json({
        message:"Budget Updated",
        data:updatedUser
    })
}

async function update(req, res) {
    const { id } = req.params; // transaction id
    const { expense, expenseType, expenseName } = req.body;

    // 1. Find and update
    const updatedTransaction = await addExpenseModel.findOneAndUpdate(
        {
            _id: id,
            user: req.user.id // security: user can update only own data
        },
        {
            expense,
            expenseType,
            expenseName
        },
        { returnDocument: 'after' } // return updated document
    );

    if (!updatedTransaction) {
        return res.status(404).json({
            message: "Transaction not found"
        });
    }

    const expenses = await addExpenseModel.find({
        user: req.user.id
    });

    const totalExpense = expenses.reduce((sum, e) => sum + e.expense, 0);

    const user = await userModel.findById(req.user.id)
    const balance = (user?.budget || 0) - totalExpense;

    // 3. Response
    res.json({
        message: "Transaction updated successfully",
        data: updatedTransaction,
        totalExpense,
        balance
    });
}

async function deleteExpense(req,res) {
    const { id } = req.params

    // Find and Delete 
    const deleteExpense = await addExpenseModel.findOneAndDelete(
       { _id:id,
        user:req.user.id
    })

    if (!deleteExpense) {
        return res.status(404).json({
            message: "Expense not found"
        });
    }
    const expenses = await addExpenseModel.find({
        user: req.user.id
    })
    
    const totalExpense = expenses.reduce((sum, e)=> sum + e.expense,0);
     const user = await userModel.findById(req.user.id)
    const balance = (user?.budget || 0) - totalExpense;

    //Response 
    res.status(200).json({
        message:"Expense Deleted Successfully",
        data: deleteExpense,
        totalExpense,
        balance
    })
}

module.exports = {transaction , update, getDashboard ,deleteExpense, updateBudget}