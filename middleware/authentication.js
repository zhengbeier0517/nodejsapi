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
  let decoded;
  try {
    decoded = jwt.verify(
      token,
      jwtConfig.accessSecret,
      {
        audience: jwtConfig.audience,
        issuer: jwtConfig.issuer,
        algorithms: jwtConfig.algorithms,
      }
    );
  } catch {
    return res.sendCommonValue(401, "Token is invalid or expired");
  }

  // Attach user info and token to request object
  req.user = {
    id: decoded.id,
    firstName: decoded.firstName,
    lastName: decoded.lastName,
    roles: decoded.roles,
  };
  req.token = token;

  return next();
};

module.exports = { authenticate };
