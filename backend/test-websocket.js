// Test script to verify WebSocket real-time updates
// Run with: node test-websocket.js

import fetch from 'node-fetch';

console.log('🧪 Testing AICOO WebSocket Real-time Updates\n');

// Simulate order creation
async function testOrderCreation() {
  console.log('📦 Creating test order via webhook...');
  
  const testOrder = {
    id: Date.now(),
    order_number: 'WS-TEST-' + Date.now(),
    total_price: "89.99",
    line_items: [
      {
        sku: "RIBEYE-16OZ",
        name: "Ribeye Steak (16oz)",
        quantity: 2,
        price: "44.99"
      }
    ],
    shipping_address: {
      zip: "10001",
      city: "New York",
      province: "NY",
      country: "US"
    }
  };

  try {
    const response = await fetch('http://localhost:3000/webhooks/orders/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Hmac-SHA256': 'test-dev-mode'
      },
      body: JSON.stringify(testOrder)
    });

    const result = await response.json();
    console.log('✅ Order created:', result.orderId);
    console.log('💡 Check your frontend Dashboard - you should see real-time updates!\n');
    
    return result;
  } catch (err) {
    console.error('❌ Error creating order:', err.message);
  }
}

// Test delivery assignment
async function testDeliveryAssignment(orderId) {
  console.log('🚗 Assigning delivery...');
  
  try {
    const response = await fetch('http://localhost:3000/api/delivery/assign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId: orderId,
        customerZip: '10001',
        weight: 2.5
      })
    });

    const result = await response.json();
    console.log('✅ Delivery assigned:', result.service, `($${result.price})`);
    console.log('💡 WebSocket should have pushed this update to all connected clients!\n');
  } catch (err) {
    console.error('❌ Error assigning delivery:', err.message);
  }
}

// Run tests
(async () => {
  console.log('🔌 Make sure your frontend is open at http://localhost:5173');
  console.log('👀 Watch the Dashboard\'s Recent Activity Feed for real-time updates\n');
  
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  const order = await testOrderCreation();
  
  if (order?.orderId) {
    await new Promise(resolve => setTimeout(resolve, 2000));
    await testDeliveryAssignment(order.orderId);
  }
  
  console.log('✨ WebSocket test complete!');
  console.log('📊 Real-time updates should appear in:');
  console.log('   - Recent Activity Feed');
  console.log('   - Quick Stats Widget');
  console.log('   - Analytics Dashboard');
  console.log('   - Connection Status (bottom-right)');
})();
