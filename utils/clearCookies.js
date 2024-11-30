module.exports = function clearCookies(res) {
  res.clearCookie("access_token");
  res.clearCookie("refresh_token");
};
