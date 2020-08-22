const getEmail = require('../utils/decode')


module.exports = (req, res, next) => {
    try {
        getEmail(req.headers);
        next();
    } catch (error) {
        return res.status(401).json({
            message: 'Auth failed'
        });
    }
};