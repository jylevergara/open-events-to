const app = require('../backend/server');

module.exports = (req, res) => {
  console.log(`${req.method} ${req.url}`);
  
  try {
    return app(req, res);
  } catch (error) {
    console.error('Handler error:', error);
    return res.status(500).json({ 
      error: error.message,
      type: error.constructor.name
    });
  }
};