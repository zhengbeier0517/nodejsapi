require('dotenv').config();
const { Sequelize } = require('sequelize');


const sequelize = new Sequelize(
  process.env.DB_NAME || 'mooc_db',
  process.env.DB_USER || 'root',
  process.env.DB_PASS || '123456', 
  {
    host: '127.0.0.1',  
    dialect: 'mysql',
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

sequelize.authenticate()
  .then(() => {
    console.log('✅ Database connected via TCP (127.0.0.1)!');
   
    return sequelize.sync({ alter: true }); 
  })
  .then(() => {
    console.log('✅ Models synchronized!');
  })
  .catch(err => {
    console.error('❌ Connection error. Please check if MySQL is running and .env is correct:', err.message);
  });

module.exports = sequelize;