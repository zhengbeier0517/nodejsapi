const express = require('express');
const app = express();
const sequelize = require('./config/db.config');

const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json'); 

const Course = require('./models/Course');
const CourseContent = require('./models/CourseContent');
const courseRoutes = require('./routes/courseContentRoutes');

app.use(express.json());


app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));


Course.hasMany(CourseContent, {
  foreignKey: 'courseId',
  as: 'contents',
  onDelete: 'CASCADE', 
  onUpdate: 'CASCADE'
});

CourseContent.belongsTo(Course, {
  foreignKey: 'courseId',
  as: 'course'
});

app.use('/api/course-content', courseRoutes);

const PORT = 3000;

sequelize.sync({ alter: true }).then(() => {
  console.log('Database & tables synced!');
  app.listen(PORT, () => {
    
    console.log(`Swagger UI: http://localhost:${PORT}/api-docs`);
    console.log(`Server is running on http://localhost:${PORT}/api/course-content/list`);
  });
}).catch(err => {
  console.error('Database sync error:', err);
});