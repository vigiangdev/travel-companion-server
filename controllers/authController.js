const User = require("../models/User");
const jwt = require("jsonwebtoken");

const signJWT = (id) => {
    const options = {
        expiresIn: process.env.JWT_EXPIRES_IN
    };
    return jwt.sign({ id }, process.env.JWT_SECRET_KEY, options);
}

const sendJWTCookie = (user, req, res) => {
    const token = signJWT(user._id);
    const options = {
        httpOnly: true,
        maxAge: process.env.JWT_COOKIE_EXPIRES_IN*24*60*60*1000
    };

    res.cookie("jwt", token, options)
    user.password = undefined;
    res.status(200).json({
        success: true,
        token: `Bearer ${token}`,
        user
    })
}

exports.createUser = async (req, res) => {
    try {
        const userInfo = {
            name: req.body.name,
            birthday: req.body.birthday,
            email: req.body.email,
            password: req.body.password,
            passwordConfirm: req.body.passwordConfirm
        }

        const newUser = await User.create(userInfo);
        sendJWTCookie(newUser, req, res);
    } catch (err) {
        res.status(400).json({
            success: false,
            message: err.message
        })
    }
}

exports.loginUser = async (req, res) => {
    try {
        const userInfo = {
            email: req.body.email,
            password: req.body.password
        }

        const user = await User.findOne({ email: userInfo.email }).select('+password')
        
        if (await user.comparePassword(userInfo.password, user.password)) {
            sendJWTCookie(user, req, res)
        } else {
            res.status(401).json({
                success: false,
                message: "Incorrect password."
            })
        }
    } catch (err) {
        res.status(401).json({
            success: false,
            message: "Unable to authenticate user."
        })
    }
}