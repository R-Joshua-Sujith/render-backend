const router = require("express").Router();
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const otpGenerator = require('otp-generator');
const jwt = require('jsonwebtoken')
const dotenv = require("dotenv");
dotenv.config();

const UserModel = require("../models/authUser.js")

const verify = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
        const token = authHeader.split(" ")[1];
        jwt.verify(token, process.env.JWT_SEC, (err, user) => {
            if (err) {
                return res.status(403).json("Token is not Valid")
            }
            req.user = user;
            next();
        })
    }
    else {
        res.status(401).json("You are not authenticated")
    }
}




router.get("/", async (req, res) => {
    res.send("Authentication Backend")
})


router.post("/signup", async (req, res) => {
    const email = req.body.email;
    const user = await UserModel.findOne({ email });
    if (user) {
        return res.status(404).json({ message: 'Account Already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    const newUser = new UserModel({
        name: req.body.name,
        email: req.body.email,
        password: hashedPassword,
        image: req.body.image
    });

    try {
        const savedUser = await newUser.save();
        res.status(200).json({ message: `Account Created Successfully` });
    } catch (err) {
        res.status(500).json(err);
    }
})

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await UserModel.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid Credentials' });
        }


        const token = jwt.sign({
            email
        }, process.env.JWT_SEC, { expiresIn: "10m" });

        res.status(200).json({ token });
    }
    catch (error) {
        res.status(500).json({ message: 'Internal Server error' });
    }

})

router.get('/users/:email', verify, async (req, res) => {
    const email = req.params.email;
    if (req.user.email === email) {
        try {
            const user = await UserModel.findOne({ email })
            if (!user) {
                return res.status(404).json({ message: "User not found" })
            }
            res.json(user)
        } catch (error) {
            res.status(500).json({ message: "Server Error" });
        }
    } else {
        res.status(403).json("You can't View this user")
    }

})

router.patch('/edit/:email', verify, async (req, res) => {
    const email = req.params.email;
    const { name, image } = req.body;

    if (req.user.email === email) {
        try {
            const user = await UserModel.findOne({ email });
            if (name) {
                user.name = name;
            }
            if (image) {
                user.image = image;
            }

            await user.save();
            return res.json({ message: "User updates Successfully" })
        } catch (err) {
            return res.status(500).json({ error: "Server Error" })
        }
    } else {
        res.status(403).json("You are not allowed to edit this user");
    }

})

router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;

    // Find user by email
    const user = await UserModel.findOne({ email });

    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    // Generate OTP

    const otp = otpGenerator.generate(6, { digits: true, alphabets: false, upperCase: false });
    const otpExpiry = Date.now() + 600000; // 10 minutes

    // Save  OTP, and their expiry to user
    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    // Send password reset email with OTP
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'joshuasujith14@gmail.com',
            pass: process.env.PASS_KEY,
        },
    });

    const mailOptions = {
        from: 'joshuasujith14@gmail.com',
        to: email,
        subject: 'Password Reset',
        text: `You are receiving this email because you requested a password reset. Your OTP is: ${otp}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
            return res.status(500).json({ message: 'Failed to send password reset email' });
        }

        res.json({ message: 'Password reset email sent' });
    });
});

router.post('/reset-password', async (req, res) => {
    const { otp, newPassword } = req.body;

    // Find user by reset token and OTP
    const user = await UserModel.findOne({
        otp,
        otpExpiry: { $gt: Date.now() },
    });

    if (!user) {
        return res.status(400).json({ message: 'Invalid OTP' });
    }

    // Update user password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    user.password = hashedPassword;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    res.json({ message: 'Password reset successful' });
});

module.exports = router;