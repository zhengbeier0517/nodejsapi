const jwt = require("jsonwebtoken");
const { jwtConfig } = require("../appConfig");
const cacheHelper = require("../common/cache/cacheHelper");

const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader ? authHeader.split(" ")[1] : "";

  // Check if token exists
  if (!token) {
    return res.sendCommonValue(401, "Token is required");
  }

  // Check if token is blacklisted
  const isBlacklisted = await cacheHelper.hasAsync(token);
  if (isBlacklisted) {
    return res.sendCommonValue(401, "Token is blacklisted");
  }

  // Check if token is valid
  try {
    const decoded = jwt.verify(
      token,
      jwtConfig.accessSecret,
      {
        audience: jwtConfig.audience,
        issuer: jwtConfig.issuer,
        algorithms: jwtConfig.algorithms,
      }
    );
    req.user = {
      id: decoded.id,
      roles: decoded.roles,
    };
    req.token = token;
  } catch {
    return res.sendCommonValue(401, "Token is invalid or expired");
  }

  return next();
};

module.exports = { authenticate };
