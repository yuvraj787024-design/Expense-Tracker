const registerModel = require('../models/auth.model')
const jwt = require('jsonwebtoken');
const bcrypt = require("bcryptjs");
const emailService = require("../services/email.service");
const tokenBlackListModel = require('../models/blackList.model');


async function registerUser(req,res) {
    try{
         const {username, email, password, budget} = req.body
         const isUserAlreadyExist = await registerModel.findOne({
            $or:[
                {username},
                {email}
            ]
         })

         if(isUserAlreadyExist){
            return res.status(409).json({
                message:"User Already Exist"
            })
         }
          
         const hash = await bcrypt.hash(password,10)
         const user = await registerModel.create({
            username,
            email,
            password:hash,
            budget
         })

         const token = jwt.sign({
            id:user._id,

         },process.env.JWT_SECRET)

         res.cookie("token",token, {
             httpOnly: true,
             sameSite: "lax",
             secure: false 
         })
          await emailService.sendRegistrationEmail(user.email, user.username)
         
        return res.status(201).json({
            message:"Registered Successfully",
            token:token,
            user:{
            id:user._id,
            username:user.username,
            email:user.email,
            budget                
            }
        })
    }catch(err){
        console.log(err)
        return res.status(500).json({
        message: "Server Error",
        error: err.message
    } )
}}

async function loginUser(req,res) {
    const { email, password} = req.body

    const user = await registerModel.findOne({
            email 
    })

    if(!user){
        return res.status(409).json({
            message:"Invalid email"
        })
    }
    const isPasswordValid = await bcrypt.compare(password,user.password)
    if(!isPasswordValid){
        return res.status(409).json({
            message:"Invalid Password"
        })
    }

    const token = jwt.sign({
        id:user._id
    },process.env.JWT_SECRET,
    {expiresIn:"1d"});

    res.cookie("token", token, {
    httpOnly: true,
    secure: false,
    sameSite: "lax"
});

    return res.status(200).json({
        message:"User Login Successfully",
        token:token,
        user:{
            id:user._id,
            username:user.username,
            email:user.email
    }
    })

}

async function logoutUser(req,res) {
    try{
        const token = req.cookies.token || req.headers.authorization?.split( " " )[1]
        if(!token){
            return res.status(200).json({
                message: "User already Logged Out"
            })
        }

        await tokenBlackListModel.create({token});

        res.clearCookie("token");

        return res.status(200).json({
            message:"User Logged out Successfully"
        })



    }catch(err){
        console.log(err)
    }

}

module.exports = { registerUser, loginUser, logoutUser }