const mongoose = require('mongoose')
const registerModel =require('../models/auth.model')

const addExpenseSchema = new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    expense:{
        type:Number,
        required:true

    },
    expenseType:{
        type:String,
        required:true
    },
    expenseName:{
        type:String,
        required:true
    },
}, { timestamps: true} );




// ================== STATIC METHOD ==================
addExpenseSchema.statics.getDashboard = async function (userId) {

     // Get user
    const user = await registerModel.findById(userId)


    // 2. Get all expenses
    const expenses = await this.find({ user: userId }).sort({ createdAt: -1 });

    // 3. Total expense
    const totalExpense = expenses.reduce((sum, e) => sum + e.expense, 0);

    // 4. Balance
    const budget = user?.budget || 0;
    const balance = budget - totalExpense;

    return {
        budget,
        totalExpense,
        balance,
        expenses
    };
};


const addExpenseModel = mongoose.model("Expense",addExpenseSchema)

module.exports = addExpenseModel
