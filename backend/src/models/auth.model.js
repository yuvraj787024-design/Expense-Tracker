const mongoose = require('mongoose')

const registerSchema = new mongoose.Schema({
    username:{
        type:String,
    },
    email:{
        type:String,
        required:true,
        unique:true  
    },
    password:{
        type:String ,
        required:true,
        type:String 
    },
     budget:{
        type:Number,
        required:true,
        default:0
    }
})

const registerModel = mongoose.model("register",registerSchema)
module.exports = registerModel