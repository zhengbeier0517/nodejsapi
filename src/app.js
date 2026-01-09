const express = require('express');
const app = express();
const courseRoutes = require('./routes/courseContentRoutes');


app.use(express.json());


app.use('/api/course-content', courseRoutes);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}/api/course-content/list`);
});