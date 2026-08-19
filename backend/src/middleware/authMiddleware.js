const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ message: "Not Authorized!" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');

        if (!user) {
            return res.status(401).json({ message: "Not Authorized!" });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({ message: "Not Authorized!" });
    }
}

module.exports = authMiddleware;