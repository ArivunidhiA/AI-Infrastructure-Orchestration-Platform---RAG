# AI Infrastructure Orchestration Platform

> A comprehensive platform for managing AI workloads, monitoring resources, optimizing costs, and providing intelligent knowledge assistance through RAG (Retrieval Augmented Generation) technology.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Available-brightgreen)](https://ai-infrastructure-with-rag.netlify.app/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Netlify Status](https://api.netlify.com/api/v1/badges/ai-infrastructure-with-rag/deploy-status)](https://app.netlify.com/sites/ai-infrastructure-with-rag)

## 🌐 Live Demo

**[👉 Try it live](https://ai-infrastructure-with-rag.netlify.app/)**

## 📸 Screenshots

![Dashboard Overview](RAG1.png)
![Workload Manager](RAG2.png)
![Cost Optimizer](RAG3.png)
![Monitoring Dashboard](RAG4.png)
![AI Knowledge Assistant](RAG5.png)
![System Architecture](RAG6.png)

## ✨ Features

### Core Infrastructure Management
- **Workload Management** - Create, monitor, and manage AI training and inference workloads
- **Resource Monitoring** - Real-time CPU, GPU, and memory usage tracking
- **Cost Optimization** - Intelligent recommendations for reducing infrastructure costs
- **Performance Analytics** - Comprehensive performance metrics and trend analysis

### AI-Powered Knowledge Assistant
- **RAG System** - Advanced Retrieval Augmented Generation for intelligent assistance
- **Document Search** - Search through technical documentation and best practices
- **Smart Recommendations** - AI-driven suggestions for infrastructure optimization
- **Contextual Help** - Get help based on your current workload and configuration

### Modern UI/UX
- **Futuristic Design** - Dark theme with glassmorphism effects and glowing elements
- **Interactive Dashboards** - Real-time data visualization with smooth animations
- **Responsive Layout** - Works perfectly on desktop, tablet, and mobile devices
- **Smooth Animations** - Framer Motion powered transitions and micro-interactions

## 🛠️ Tech Stack

**Frontend:**
- React 18 | Tailwind CSS | Framer Motion | Recharts | Axios

**Backend:**
- Node.js | Netlify Functions | Serverless Architecture

## 🚀 Quick Start

### Prerequisites

- Node.js 16+ and npm/yarn
- Netlify account (for deployment)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/ArivunidhiA/AI-Infrastructure-Orchestration-Platform---RAG.git
   cd AI-Infrastructure-Orchestration-Platform---RAG/ai-infrastructure-platform
   ```

2. **Install dependencies**
   ```bash
   cd frontend
   npm install
   ```

3. **Start development server**
   ```bash
   npm start
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - API: http://localhost:8888/api (with Netlify CLI)

## 📁 Project Structure

```
ai-infrastructure-platform/
├── frontend/              # React frontend application
│   ├── src/
│   │   ├── components/   # React components
│   │   └── services/     # API services
│   └── package.json
├── netlify/
│   └── functions/        # Serverless backend functions
├── netlify.toml          # Netlify configuration
└── README.md
```

## 🚀 Deployment

### Netlify (Recommended)

1. Connect your GitHub repository to [Netlify](https://netlify.com)
2. Configure build settings:
   - **Build command:** `cd frontend && npm install && npm run build`
   - **Publish directory:** `frontend/build`
   - **Base directory:** `.`
3. Deploy! Your app will be live automatically.

### Alternative Platforms

- **Vercel** - Works with minimal configuration
- **GitHub Pages** - Static hosting for frontend only
- **AWS S3 + CloudFront** - For enterprise deployments

## 🔧 Configuration

### Environment Variables

- `REACT_APP_API_URL` - API base URL (defaults to `/api` for Netlify)

The backend is implemented as Netlify Functions in `netlify/functions/`:
- Handles all API endpoints
- Provides mock data for demonstration
- Includes CORS headers for cross-origin requests
- Supports all CRUD operations for workloads and metrics

## 📊 Key Capabilities

- **Real-time Metrics** - Live CPU, GPU, and memory usage tracking
- **Performance Trends** - Historical data analysis and trend visualization
- **Cost Tracking** - Monitor and optimize infrastructure costs
- **Smart Alerts** - Automated notifications for resource usage
- **Vector Search** - Semantic search using vector similarity
- **Contextual Responses** - AI-generated responses based on infrastructure

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- React team for the amazing framework
- Tailwind CSS for the utility-first approach
- Framer Motion for smooth animations
- Netlify for excellent hosting and serverless functions
- The open-source community for inspiration and tools

---

**Built with ❤️ for the AI Infrastructure community**
