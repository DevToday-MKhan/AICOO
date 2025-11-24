# AICOO™ — AI Chief Operating Officer
**Version 2.0 — Enterprise Operational Intelligence**

## 🎯 Mission
AICOO is the centralized AI Chief Operating Officer for ChickenToday™, the Today™ Network, and any Shopify merchant connected to the system. AICOO provides operational strategy, intelligent automation, data-driven decision-making, and predictive business leadership.

## 🧠 Core Capabilities

### 1. **Operational Strategy**
- Store trend analysis and growth forecasting
- Bottleneck detection and resolution
- Proactive recommendations for pricing, delivery, and fulfillment

### 2. **Systems Intelligence**
- Real-time monitoring of APIs, routing, delivery, and webhooks
- Anomaly detection with corrective action proposals
- Performance tracking and degradation alerts

### 3. **Commerce & Logistics Brain**
- **Courier Comparison**: FedEx, UPS, DHL optimization
- **Rideshare Comparison**: Uber vs Lyft cost analysis
- **Route Optimization**: Intelligent pathfinding
- **Slaughterhouse Assignment**: Smart facility matching
- **Delivery Forecasting**: Cost and ETA predictions

### 4. **Shopify Expertise**
- Webhook interpretation and analysis
- Order pattern recognition (AOV, region, weight, repeats)
- Checkout optimization recommendations
- Settings intelligence and configuration guidance

### 5. **Execution Layer**
- Automated routing assignments
- Delivery engine orchestration
- Admin operation triggers
- `/assign` command processing
- Safe Mode fallback activation

### 6. **Predictive Intelligence**
- Problem anticipation before occurrence
- Future scenario simulation
- What-if analysis generation
- Proactive business move suggestions

## 💼 Personality & Values

**Core Personality:**
- Hyper-analytical yet human-centered
- Calm, precise, structured, and strategic
- Zero fluff, zero panic, zero noise
- Executive tone: clear, authoritative, professional
- Insight-first, action-second, reassurance-third

**Value System:**
- Clarity over confusion
- Data over assumptions
- Action over theory
- Safety over speed (in production)
- Accuracy over excitement
- Founder's vision above everything

## 🗣️ Communication Style

AICOO responds using this framework:
1. **Status Summary** — Current state overview
2. **Key Insights** — Data-driven observations
3. **Risks / Anomalies** — Warnings and alerts
4. **Operational Recommendations** — Strategic guidance
5. **Action Items (1–3 steps)** — Clear next steps
6. **Optional Deep Dive** — Technical details when needed

## 🚀 Quick Start

### Backend Setup
```bash
cd backend
npm install
cp ../config/env.example .env
# Add your OPENAI_API_KEY and SHOPIFY_SECRET to .env
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Chat Commands
- `/assign [orderID]` — Assign delivery for specific order
- `/memory` — View AICOO memory & learning data
- `health` — Check system status
- `analyze orders` — Review recent order trends
- Natural language queries for operational insights

### Command Palette (Ctrl+K / Cmd+K)
Global command launcher available throughout the app:
- `assign <orderId>` — Assign delivery
- `route <zip> <weight>` — Get routing quote
- `courier <fromZip> <toZip> <weight>` — Compare couriers
- `ride <fromZip> <toZip>` — Compare rideshares
- `memory` — View AICOO memory
- `orders` — View recent orders
- `deliveries` — View delivery history
- `events` — View system events
- `health` — Check system health
- `clear events|orders|deliveries|routes` — Clear data
- `help` — Show all commands

**Features:**
- Keyboard navigation (↑ ↓ Enter)
- Fuzzy search
- Instant execution
- Real-time results
- Error handling with fallbacks

## 📊 API Endpoints

### Core Operations
- `POST /api/gpt` — AICOO chat interface
- `POST /api/delivery/assign` — Smart delivery assignment
- `POST /api/route/quote` — Route optimization quotes
- `GET /api/health` — System health monitoring

### Admin Tools
- `GET /api/admin/export-all` — Full JSON backup
- `GET /api/admin/export-zip` — ZIP backup download
- `GET /api/admin/mode` — Current environment mode
- `POST /api/admin/clear` — Clear specific data
- `POST /api/admin/reset` — Full system reset

### Data Access
- `GET /api/events` — Webhook event history
- `GET /api/orders/latest` — Most recent Shopify order
- `GET /api/delivery/latest` — Latest delivery assignment
- `GET /api/courier/history` — Courier comparison history
- `GET /api/ride/history` — Rideshare comparison history
- `GET /api/route/history` — Route optimization history

## 🛡️ Production Features

### Safe Mode
When routing or delivery assignment fails, AICOO automatically activates Safe Mode:
- Defaults to Lyft rideshare
- Fixed pricing: $7.99
- Estimated time: 5 minutes
- Logs warning for review

### Environment Modes
- **DEV Mode**: Verbose logging, detailed errors
- **LIVE Mode**: Discreet logging, error file tracking

### Health Monitoring
Real-time tracking of:
- Backend services status
- Storage accessibility (8 JSON files)
- Routing engine health
- Delivery system readiness
- Webhook processing state
- System uptime and counts

### Backup & Recovery
- **JSON Export**: Complete data backup with metadata
- **ZIP Export**: Compressed archive for archival
- **Auto-versioning**: Timestamp and version tracking
- **Storage Health**: File integrity verification

## 📁 Architecture

```
AICOO/
├── backend/
│   ├── server.js          # Express server + health monitoring
│   ├── gpt.js             # AICOO v2.0 brain (OpenAI GPT-4o)
│   ├── delivery.js        # Delivery assignment engine
│   ├── routing.js         # Route optimization
│   ├── courier.js         # FedEx/UPS/DHL comparison
│   ├── ride.js            # Uber/Lyft comparison
│   ├── shopify.js         # Shopify webhook handler
│   ├── webhooks.js        # Event storage & retrieval
│   ├── settings.js        # Configuration management
│   ├── suggestions.js     # Business recommendations
│   ├── admin/
│   │   └── backup.js      # Export & health utilities
│   └── data/              # Persistent JSON storage
│       ├── events.json
│       ├── orders.json
│       ├── deliveries.json
│       ├── routes.json
│       ├── courier.json
│       ├── ride.json
│       ├── settings.json
│       └── slaughterhouses.json
├── frontend/
│   └── src/
│       ├── App.jsx            # Main app shell with Command Palette
│       ├── Navigation.jsx     # Page routing
│       ├── components/
│       │   └── CommandPalette.jsx  # Global Ctrl+K command launcher
│       └── pages/
│           ├── Chat.jsx       # AICOO conversation UI
│           ├── Dashboard.jsx  # Analytics & monitoring
│           └── Admin.jsx      # System controls
└── config/
    ├── constants.js       # System constants
    └── routes.json        # Route database
```

## 🔐 Security

- **HMAC Verification**: SHA256 webhook authentication
- **Timing-Safe Comparison**: Prevents timing attacks
- **Environment Variables**: Secure credential storage
- **No Credential Logging**: Sensitive data protection

## 📈 Performance

- **Uptime Tracking**: Real-time monitoring since boot
- **Error Tracking**: Last error with context
- **Storage Monitoring**: File size and accessibility
- **Count Tracking**: Events, deliveries, routes, couriers, rides

## 🌐 Use Cases

1. **Order Processing**: Shopify order → Route optimization → Delivery assignment
2. **Cost Analysis**: Compare all courier/rideshare options for best price
3. **Trend Analysis**: Analyze order patterns and forecast demand
4. **Incident Response**: Detect anomalies and suggest corrections
5. **Strategic Planning**: What-if scenarios and growth projections

## 🤝 Identity

> "I am AICOO™, your AI Chief Operating Officer.  
> My job is to analyze, optimize, protect, and grow your business using operational intelligence, data analysis, and strategic automation.  
> I act as your COO — reliable, sharp, and always thinking ahead."

## 📞 Support

Built by **Mohsin Khan** for the **Today™ Network**  
AICOO operates with loyalty to the founder's vision and directives.

---

**Version**: 2.0  
**Model**: GPT-4o  
**Status**: Production Ready  
**Last Updated**: November 24, 2025
