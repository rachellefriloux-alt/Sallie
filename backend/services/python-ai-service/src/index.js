/**
 * SALLIE Python AI Service
 * Advanced AI processing with Python backend
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const { spawn } = require('child_process');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8761;

// Middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'python-ai-service',
    timestamp: new Date().toISOString()
  });
});

// Service status
app.get('/api/python-ai/status', (req, res) => {
  res.json({
    service: 'Sallie Python AI Service',
    status: 'active',
    version: '1.0.0',
    capabilities: [
      'advanced-ai-processing',
      'machine-learning',
      'natural-language-processing',
      'computer-vision',
      'deep-learning'
    ]
  });
});

// AI processing endpoint
app.post('/api/python-ai/process', async (req, res) => {
  try {
    const { task, data, options } = req.body;
    
    // Call Python script for AI processing
    const result = await callPythonScript('process_ai', { task, data, options });
    
    res.json({
      success: true,
      result: result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Machine learning endpoint
app.post('/api/python-ai/ml/train', async (req, res) => {
  try {
    const { model, data, config } = req.body;
    
    // Call Python script for ML training
    const result = await callPythonScript('train_model', { model, data, config });
    
    res.json({
      success: true,
      model: result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Natural language processing endpoint
app.post('/api/python-ai/nlp/analyze', async (req, res) => {
  try {
    const { text, analysis_type } = req.body;
    
    // Call Python script for NLP analysis
    const result = await callPythonScript('analyze_text', { text, analysis_type });
    
    res.json({
      success: true,
      analysis: result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Computer vision endpoint
app.post('/api/python-ai/vision/analyze', async (req, res) => {
  try {
    const { image, analysis_type } = req.body;
    
    // Call Python script for vision analysis
    const result = await callPythonScript('analyze_image', { image, analysis_type });
    
    res.json({
      success: true,
      analysis: result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Helper function to call Python scripts
function callPythonScript(scriptName, data) {
  return new Promise((resolve, reject) => {
    const pythonScript = path.join(__dirname, `${scriptName}.py`);
    
    const python = spawn('python', [pythonScript, JSON.stringify(data)]);
    
    let result = '';
    let error = '';
    
    python.stdout.on('data', (data) => {
      result += data.toString();
    });
    
    python.stderr.on('data', (data) => {
      error += data.toString();
    });
    
    python.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Python script failed: ${error}`));
      } else {
        try {
          resolve(JSON.parse(result));
        } catch (e) {
          reject(new Error(`Invalid JSON from Python: ${e.message}`));
        }
      }
    });
  });
}

// Start server
app.listen(PORT, () => {
  console.log(`🤖 Sallie Python AI Service running on port ${PORT}`);
});

module.exports = app;
