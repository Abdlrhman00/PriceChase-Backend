const jwt = require('jsonwebtoken');

module.exports = async(payload, expiresIn)=>{

    const token = jwt.sign(
        payload,
        process.env.JWT_SECRET_KEY,
        {expiresIn}
    );
    
    return token;
}