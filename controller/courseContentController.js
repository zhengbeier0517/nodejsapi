const service = require('../service/courseContentService'); // 这里去掉了 's'

exports.getContents = async (req, res) => {
  try {
    const { courseId } = req.query; 
    
    const data = await service.findAllContents(courseId);
    
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};