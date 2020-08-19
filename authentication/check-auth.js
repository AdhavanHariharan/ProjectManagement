const jwt = require('jsonwebtoken');
const getEmail = require('../utils/decode')


module.exports = (req, res, next) => {
    try {
        var decoded= getEmail(req.headers);
        req.userData = decoded;
        next();
    } catch (error) {
        return res.status(401).json({
            message: 'Auth failed'
        });
    }
};