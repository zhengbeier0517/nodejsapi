const authService = require("../service/authService");

const register = async (req, res) => {
  const user = {};
  user.userName = req.body.userName;
  user.password = req.body.password;
  user.email = req.body.email;
  user.otp = req.body.otp;

  
  user.firstName = req.body.firstName;
  user.lastName = req.body.lastName;

  const result = await authService.register(user);
  if (result.isSuccess) {
    res.sendCommonValue(201, result.message, result.data);
  } else {
    res.sendCommonValue(400, result.message);
  }
};


const login = async (req, res) => {
  const user = {};
  user.userName = req.body.userName;
  user.password = req.body.password;

  const result = await authService.login(user);
  if (result.isSuccess) {
    res.sendCommonValue(200, result.message, result.data);
  } else {
    res.sendCommonValue(400, result.message);
  }
};

const logout = async (req, res) => {
  const token = req.token;

  const result = await authService.logout(token);
  if (result.isSuccess) {
    res.sendCommonValue(204, result.message);
  } else {
    res.sendCommonValue(401, result.message);
  }
};

module.exports = {
  register,
  login,
  logout,
};
