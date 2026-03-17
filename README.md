# Emergency Response Simulation

> A web-based simulation demonstrating proximity-based emergency alert system with 3D map visualization and AI-powered audio briefings for the Zurich Hackathon 2026.

## 🎯 Problem Statement

For cardiac arrest, survival chance drops 7-10% per minute without CPR. Ambulances often need 8-12+ minutes to arrive, while nearby first responders could reach the scene in 0-4 minutes. That time gap is the difference between life and death.

## 💡 Solution

An interactive simulation showing how proximity-based matching connects cardiac arrest victims with nearby medically-trained first responders, featuring:

- Real-time TTS audio briefing delivered en-route (AWS Polly)
- Intelligent radius escalation (300m → 400m → 600m)
- 3D map visualization with real Swiss geography
- Response time comparison vs traditional ambulance

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Maptiler API key (free, no payment info)
- AWS credentials (for Polly TTS)

### Installation

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Add your API keys to .env

# Start development server
npm run dev
```

### Environment Variables

```bash
# Maptiler (3D Map - Free, No Payment Info)
# Get key from: https://cloud.maptiler.com/
VITE_MAPTILER_KEY=your_key_here

# AWS Polly (TTS Audio Briefing)
# Get credentials from: https://console.aws.amazon.com/iam/
VITE_AWS_REGION=us-east-1
VITE_AWS_ACCESS_KEY_ID=your_key
VITE_AWS_SECRET_ACCESS_KEY=your_secret
VITE_AWS_POLLY_VOICE_ID=Joanna
VITE_AWS_POLLY_ENGINE=neural
```

## 🎮 How to Use

1. **Place Emergency**: Press `Ctrl+Space` anywhere on the map
2. **Select Patient**: Choose from dropdown (10 realistic profiles)
3. **Start Emergency**: Click "Start Emergency" button
4. **Watch Simulation**: 
   - 2 nearest responders dispatched automatically
   - TTS briefing plays with patient details
   - Responders navigate along real streets at 50 km/h
   - Radius escalates if no responders found

## ✨ Key Features

### Core Functionality
- 3D map visualization (MapLibre + Maptiler)
- Proximity-based responder matching
- Automatic radius escalation (300m → 400m → 600m)
- Real-time responder movement along actual streets
- TTS audio briefing with patient medical history

### Innovation Highlights
- 🎙️ Hands-free audio briefing delivered while responders are en-route
- 🗺️ 3D building visualization for Swiss cities
- 📊 Intelligent ranking: 60% distance + 40% certification
- ⚡ Uniform speed simulation (50 km/h)

## 📁 Project Structure

```
src/
├── components/
│   ├── Map/              # 3D map, markers, radius circles
│   └── Dashboard/        # Control panel, UI
├── lib/
│   ├── algorithms/       # Proximity matching, survival calculation
│   ├── services/         # AWS Polly, routing, TTS
│   ├── data/            # Mock responders & patients
│   └── utils/           # Distance calculations
├── types/               # TypeScript definitions
├── hooks/               # useResponderSimulation
└── store/               # Zustand state management
```

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Map**: MapLibre GL JS + Maptiler
- **Styling**: Tailwind CSS
- **State**: Zustand
- **TTS**: AWS Polly (Neural voices)
- **Routing**: OSRM (Open Source Routing Machine)

## 🧮 Algorithms

### Proximity Matching
```typescript
// Filter responders within radius
// Rank by: 60% distance + 40% certification level
// Send 2 nearest responders
// Escalate radius if 0 found (300m → 400m → 600m)
```

### Survival Probability
```typescript
// Base: 90% at 0 minutes
// Drops 8.5% per minute without CPR
// Responder arrival: 2-4 min (70-90% survival)
// Ambulance arrival: 8-12 min (20-40% survival)
```

### Responder Movement
```typescript
// Uniform speed: 50 km/h (13.9 m/s)
// Real street routing via OSRM
// Fallback to straight-line if routing fails
// Smooth animation via requestAnimationFrame
```

## 📊 Success Metrics

| Metric | With System | Without System |
|--------|-------------|----------------|
| Response Time | 2-4 min | 8-12 min |
| Survival Probability | 70-90% | 20-40% |
| Time Saved | 6-8 min | - |

## 🔒 Security & Ethics

### Security
- No hardcoded secrets (environment variables)
- AWS IAM minimal permissions
- Input validation with TypeScript strict mode
- Proper error handling with type guards

### Ethics & Privacy
- All patient data is synthetic (mock data)
- GDPR considerations documented
- Transparent matching algorithm
- No bias in responder selection

## 🚢 Deployment

### Vercel (Recommended)

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

Add environment variables in Vercel dashboard:
- `VITE_MAPTILER_KEY`
- `VITE_AWS_REGION`
- `VITE_AWS_ACCESS_KEY_ID`
- `VITE_AWS_SECRET_ACCESS_KEY`

## 📝 Development

### Available Scripts

```bash
npm run dev      # Start dev server (http://localhost:5173)
npm run build    # Production build
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

### Code Standards

- TypeScript strict mode enabled
- Explicit types on exported functions
- Immutable updates (spread operator)
- No `any` types (use `unknown` with type guards)
- No `console.log` in production code

## 🏆 Hackathon Deliverables

- ✅ Live demo (deployed on Vercel)
- ✅ Source code (GitHub repository)
- ✅ Documentation (README, architecture)
- ✅ Clean, production-ready code

## 📚 API Setup Guides

### Maptiler (3D Map)
1. Sign up at https://cloud.maptiler.com/ (no payment info)
2. Copy API key from dashboard
3. Add to `.env` as `VITE_MAPTILER_KEY`
4. Free tier: 100,000 map loads/month

### AWS Polly (TTS)
1. Go to https://console.aws.amazon.com/iam/
2. Create IAM user with Polly permissions
3. Generate access key
4. Add credentials to `.env` with `VITE_` prefix
5. Free tier: 5M characters/month for 12 months

## 🤝 Contributing

This is a hackathon project built for demonstration purposes. For questions or suggestions, open an issue.

## 📄 License

MIT License

## 🙏 Acknowledgments

- Swiss Emergency Services (144)
- Momentum, Save a Life apps (inspiration)
- Maptiler (free 3D maps)
- AWS (Polly TTS)
- OSRM (free routing)

---

**Built for**: Zurich Hackathon 2026  
**Track**: Retail / Local Services / Marketplace  
**Challenge**: Emergency Response Coordination
