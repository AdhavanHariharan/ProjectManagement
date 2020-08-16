const jwt = require("jsonwebtoken");

//common function to getEmail from the request headers
module.exports= function (headers)
{
    var authorization = headers.authorization.split(' ')[1];
    var decoded = jwt.verify(authorization,process.env.JWT_KEY);
    return decoded.email;
}