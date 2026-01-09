require('dotenv').config();
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    dialect: 'mysql',
    logging: false,
    dialectOptions: {
      socketPath: '/tmp/mysql.sock'
    }
  }
);

sequelize.authenticate()
  .then(() => {
    console.log('✅ Database connected!');
    return sequelize.sync({ alter: true });
  })
  .then(() => {
    console.log('✅ Models synchronized!');
  })
  .catch(err => {
    const altSequelize = new Sequelize(
      process.env.DB_NAME,
      process.env.DB_USER,
      process.env.DB_PASS,
      {
        dialect: 'mysql',
        logging: false,
        dialectOptions: {
          socketPath: '/tmp/mysql.sock.lock'
        }
      }
    );
    return altSequelize.authenticate()
      .then(() => {
        console.log('✅ Connected via alternative socket!');
        return altSequelize.sync({ alter: true });
      });
  })
  .catch(err => console.error('❌ Connection error:', err));

module.exports = sequelize;