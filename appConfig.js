const converHelper = require("./common/convertHelper");

require("dotenv").config({
  path: `.env.${process.env.NODE_ENV || "development"}`,
});

require("dotenv").config({
  path: `.env.${process.env.NODE_ENV || "development"}.local`,
  override: true,
});

module.exports = {
  serverConfig: {
    port: process.env.SERVER_PORT || 9000,
  },
  corsConfig: {
    origin: process.env.CORS_ORIGIN,
  },
  bcryptConfig: {
    saltRounds: Number(process.env.SALT_ROUNDS),
  },
  jwtConfig: {
    accessSecret: process.env.JWT_ACCESS_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    audience: process.env.JWT_AUDIENCE,
    issuer: process.env.JWT_ISSUER,
    algorithms: [process.env.JWT_ALGORITHMS],
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN,
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
  },
  mysqlConfig: {
    host: process.env.MYSQL_HOST,
    port: process.env.MYSQL_PORT,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
  },
  cacheConfig: {
    useReids: converHelper.stringToBoolean(process.env.USE_REDIS),
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
  },
};
