const jwt = require("jsonwebtoken");
const userModel = require("../models/auth.model");

const authMiddleware = async (req, res, next) => {
    const token =
        req.cookies.token ||
        req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(401).json({
            message: "Unauthorized access, token missing"
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await userModel.findById(decoded.id);

        if (!user) {
            return res.status(401).json({
                message: "User not found"
            });
        }

        req.user = user;

        next();
    } catch (err) {
        return res.status(401).json({
            message: "Invalid token"
        });
    }
};

module.exports = { authMiddleware };
