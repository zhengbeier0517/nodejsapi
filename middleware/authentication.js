const jwt = require("jsonwebtoken");
const { jwtConfig } = require("../appConfig");
const cacheHelper = require("../common/cache/cacheHelper");

const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const accessToken = authHeader ? authHeader.split(" ")[1] : "";

  // Check if token is provided
  if (!accessToken) {
    return res.sendCommonValue(401, "Access token is required");
  }

  // Check if token is valid
  let decoded;
  try {
    decoded = jwt.verify(
      accessToken,
      jwtConfig.accessSecret,
      {
        audience: jwtConfig.audience,
        issuer: jwtConfig.issuer,
        algorithms: jwtConfig.algorithms,
      }
    );
  } catch {
    return res.sendCommonValue(401, "Access token is invalid or expired");
  }

  // Check if token is blacklisted
  const isBlacklisted = await cacheHelper.hasAsync(`auth:access:${decoded.id}:${decoded.jti}`);
  if (isBlacklisted) {
    return res.sendCommonValue(401, "Access token is blacklisted");
  }

  // Check if user is forced to logout
  const forceLogoutAt = await cacheHelper.getAsync(`auth:forceLogout:${decoded.id}`);
  if (forceLogoutAt && decoded.iat * 1000 < forceLogoutAt) {
    return res.sendCommonValue(401, "User is forced to logout");
  }

  // Attach user info and token to request object
  req.user = {
    id: decoded.id,
    firstName: decoded.firstName,
    lastName: decoded.lastName,
    roles: decoded.roles,
  };
  req.token = accessToken;

  return next();
};

module.exports = { authenticate };
