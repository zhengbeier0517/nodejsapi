const service = require('../services/courseContentService');

exports.getContents = async (req, res) => {
  try {
    const { courseId } = req.query; 
    
    const data = await service.findAllContents(courseId);
    
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};