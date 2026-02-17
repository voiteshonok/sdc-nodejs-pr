/**
 * Test script to send reload message via WebSocket
 * Usage: node test-reload.js
 */

const WebSocket = require('ws');

const ws = new WebSocket('ws://localhost:3001');

ws.on('open', () => {
  console.log('Connected to WebSocket server');
});

ws.on('message', (data) => {
  try {
    const message = JSON.parse(data.toString());
    if (message.type === 'welcome') {
      console.log('Received welcome message:', message.message);
      console.log('Timestamp:', message.timestamp);
    } else {
      console.log('Received message:', data.toString());
    }
  } catch (e) {
    // If not JSON, treat as plain string
    console.log('Received message:', data.toString());
  }
  
  // After receiving welcome, send reload message
  console.log('Sending reload message...');
  ws.send('reload');
  
  // Close after a short delay
  setTimeout(() => {
    ws.close();
    process.exit(0);
  }, 1000);
});

ws.on('error', (error) => {
  console.error('WebSocket error:', error.message);
  process.exit(1);
});

ws.on('close', () => {
  console.log('Connection closed');
});

