
const setCookie = (res,tokenType,token,maxAge) =>{

    res.cookie(tokenType, token, {
        httpOnly: true,
        secure: true,
        maxAge, 
        sameSite: "None",
      });

}

module.exports = setCookie;


