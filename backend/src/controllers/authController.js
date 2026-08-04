const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger  = require('../utils/logger');

const signup = async (req,res) => {
    try {
        const {name,email,password} = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
            message: "Please provide name, email, and password",
            });
        }

        const userExists = await User.findOne({email});

        if(userExists){
            return res.status(400).json({
            message: "User already exists",
        });
        }

        const hashPassword = await bcrypt.hash(password,10);
        const user = await User.create({name,email,password:hashPassword});

        const token = jwt.sign({ id: user._id },process.env.JWT_SECRET,{expiresIn: process.env.JWT_EXPIRES_IN || "7d"});

        res.cookie('token', token, {
            httpOnly: true,
            sameSite: "lax",
            secure: false
        });
        
        return res.status(201).json({
            message: "User registered successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
            },
        });
    } catch (error) {
        logger.error(error.message);

        return res.status(500).json({
            message:"Server Error"
        });
    }
}

const login = async (req,res) => {
    try {
        const {email,password} = req.body;

        if(!email || !password){
            return res.status(400).json({
                message:"Please provide Email and Password"
            });
        }

        const user = await User.findOne({email});
        if(!user){
            return res.status(401).json({
                message:"Invalid Credentials"
            });
        }

        const isPassValid = await bcrypt.compare(password, user.password);

        if(!isPassValid){
            return res.status(401).json({
                message: "Invalid Credentials"
            });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || "7d"});

        res.cookie('token', token, {
            httpOnly: true,
            sameSite: "lax",
            secure: false
        });
        
        return res.status(200).json({
            message: "Login Successful! Redirecting....",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
            },
        });

    } catch (error) {
        logger.error(error.message);

        return res.status(500).json({
            message: "Server Error"
        });
    }
}

const logout = (req,res) => {
    
    res.clearCookie("token", {
        httpOnly: true,
        sameSite: "lax",
        secure: false,
    });

    res.status(200).json({message: "Logged out Successully"});
}

module.exports = {signup,login,logout};
