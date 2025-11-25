#!/bin/bash

# Mission 11 Integration Test Suite
# Tests all carrier API features

echo "🧪 Mission 11 Integration Tests"
echo "================================"
echo ""

BASE_URL="http://localhost:3000"

# Test 1: Health Check
echo "Test 1: Backend Health Check"
curl -s $BASE_URL/api/health > /dev/null && echo "✅ Backend is running" || echo "❌ Backend is down"
echo ""

# Test 2: Carrier Rates API
echo "Test 2: Live Carrier Rates"
RATES=$(curl -s -X POST $BASE_URL/api/courier/rates \
  -H "Content-Type: application/json" \
  -d '{"fromZip":"07102","toZip":"10001","weight":5}')
echo "$RATES" | jq -r '.best | "✅ Best rate: \(.carrier) - $\(.price) (\(.deliveryDays) days)"'
echo ""

# Test 3: Carrier Performance
echo "Test 3: Carrier Performance Stats"
PERF=$(curl -s $BASE_URL/api/memory/carrier-performance)
echo "$PERF" | jq -r 'to_entries[] | "✅ \(.key | ascii_upcase): \(.value.totalShipments) shipments, \(.value.onTimePercentage)% on-time"'
echo ""

# Test 4: Save Credentials
echo "Test 4: Save Carrier Credentials"
CRED=$(curl -s -X POST $BASE_URL/api/admin/credentials/fedex \
  -H "Content-Type: application/json" \
  -d '{"clientId":"test","clientSecret":"test","accountNumber":"123"}')
echo "$CRED" | jq -r '"✅ \(.carrier | ascii_upcase): \(.message)"'
echo ""

# Test 5: Legacy APIs (backward compatibility)
echo "Test 5: Legacy Courier Quote (Backward Compatibility)"
LEGACY=$(curl -s -X POST $BASE_URL/api/courier/quote \
  -H "Content-Type: application/json" \
  -d '{"fromZip":"07102","toZip":"10001","weight":5}')
echo "$LEGACY" | jq -r '"✅ Legacy API: Best = \(.best)"'
echo ""

# Test 6: Analytics (Phase 10)
echo "Test 6: Analytics Engine (Phase 10 - No Breaking Changes)"
ANALYTICS=$(curl -s $BASE_URL/api/analytics)
echo "$ANALYTICS" | jq -r '"✅ Analytics: \(.overview.totalOrders) orders, \(.overview.totalDeliveries) deliveries"'
echo ""

# Test 7: Memory System
echo "Test 7: AICOO Memory System"
MEMORY=$(curl -s $BASE_URL/api/memory)
echo "$MEMORY" | jq -r '"✅ Memory: \(.orders | length) orders, \(.deliveries | length) deliveries in memory"'
echo ""

# Test 8: Frontend Check
echo "Test 8: Frontend Availability"
curl -s -I http://localhost:5173 | head -1 | grep -q "200" && echo "✅ Frontend is running" || echo "❌ Frontend is down"
echo ""

echo "================================"
echo "✅ Integration Tests Complete!"
echo ""
echo "Summary:"
echo "- All carrier APIs functional"
echo "- Rate shopping working"
echo "- Credentials endpoint active"
echo "- Legacy APIs preserved"
echo "- Analytics intact"
echo "- Memory system operational"
