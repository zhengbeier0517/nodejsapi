const jwt = require("jsonwebtoken");
const { jwtConfig } = require("../appConfig");
const cacheHelper = require("../common/cache/cacheHelper");

const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader ? authHeader.split(" ")[1] : "";

  // Check if token is provided
  if (!token) {
    return res.sendCommonValue(401, "Please login first");
  }

  // Check if token is blacklisted
  const isBlacklisted = await cacheHelper.hasAsync(token);
  if (isBlacklisted) {
    return res.sendCommonValue(401, "Blacklisted token, please login again");
  }

  // Check if token is valid
  try {
    const decoded = jwt.verify(
      token,
      jwtConfig.secret,
      {
        audience: jwtConfig.audience,
        issuer: jwtConfig.issuer,
        algorithms: jwtConfig.algorithms,
      },
    );
    req.user = {
      id: decoded.id,
      roles: decoded.roles,
    };
    req.token = token;
  } catch {
    return res.sendCommonValue(401, "Invalid token, please login again");
  }

  return next();
};

module.exports = { authenticate };
