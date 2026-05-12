const express = require("express")
const cookieParser = require('cookie-parser');
const cors = require("cors");
const authRoutes = require("../src/routes/auth.route")
const transactionRoutes = require("../src/routes/transaction.route")

const app = express()

app.use(express.json())
app.use(cookieParser())


app.use(cors({
    origin: [
        "http://localhost:5500",
        "http://127.0.0.1:5500",
        "https://expense-tracker-7l5v.vercel.app"
    ],
    credentials: true
}))

app.use('/api/auth',authRoutes)
app.use('/api',transactionRoutes)




module.exports = app