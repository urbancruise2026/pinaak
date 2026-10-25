import express from 'express';
import { messaging } from '../../config/firebase.js'; // Yeh path sahi hai, file name check karein

const router = express.Router();

let deviceTokens = [];
let topics = {};

// Register device token
router.post('/register-token', (req, res) => {
  try {
    const { token, userId, deviceInfo } = req.body;
    
    if (!token) {
      return res.status(400).json({ 
        success: false, 
        error: 'Token is required' 
      });
    }
    
    const exists = deviceTokens.some(t => t.token === token);
    
    if (!exists) {
      deviceTokens.push({
        token,
        userId: userId || null,
        deviceInfo: deviceInfo || {},
        registeredAt: new Date().toISOString()
      });
      console.log('📱 New device token registered');
    }
    
    res.status(201).json({
      success: true,
      message: 'Token registered successfully',
      tokenCount: deviceTokens.length
    });
    
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get all tokens
router.get('/tokens', (req, res) => {
  res.json({
    success: true,
    count: deviceTokens.length,
    tokens: deviceTokens
  });
});

// Send notification
router.post('/send', async (req, res) => {
  try {
    const { token, title, body, data } = req.body;
    
    if (!token) {
      return res.status(400).json({ 
        success: false, 
        error: 'Token is required' 
      });
    }
    
    if (!messaging) {
      return res.status(503).json({ 
        success: false, 
        error: 'Firebase messaging not initialized' 
      });
    }
    
    const message = {
      notification: {
        title: title || 'New Notification',
        body: body || 'You have a new notification'
      },
      data: data || {},
      token: token
    };
    
    const response = await messaging.send(message);
    console.log('✅ Notification sent');
    
    res.json({
      success: true,
      message: 'Notification sent',
      response
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
    
    if (error.code === 'messaging/registration-token-not-registered') {
      deviceTokens = deviceTokens.filter(t => t.token !== req.body.token);
    }
    
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    timestamp: new Date().toISOString(),
    firebaseInitialized: !!messaging,
    deviceTokens: deviceTokens.length,
    topics: Object.keys(topics).length
  });
});

export default router;