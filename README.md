# AI Infrastructure Orchestration Platform

> A comprehensive platform for managing AI workloads, monitoring resources, optimizing costs, and providing intelligent knowledge assistance through RAG (Retrieval Augmented Generation) technology.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Available-brightgreen)](https://ai-infrastructure-with-rag.netlify.app/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Netlify Status](https://api.netlify.com/api/v1/badges/ai-infrastructure-with-rag/deploy-status)](https://app.netlify.com/sites/ai-infrastructure-with-rag)

## 🛠️ Tech Stack

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Netlify](https://img.shields.io/badge/Netlify-00C7B7?style=for-the-badge&logo=netlify&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white)
![Recharts](https://img.shields.io/badge/Recharts-FF6B6B?style=for-the-badge&logo=chartdotjs&logoColor=white)

## 🌐 Live Demo

**[👉 Try it live](https://ai-infrastructure-with-rag.netlify.app/)**

## 📸 Screenshots

<table>
  <tr>
    <td align="center">
      <img src="RAG1.png" alt="Dashboard Overview" width="300"/>
      <br><strong>Dashboard Overview</strong>
    </td>
    <td align="center">
      <img src="RAG2.png" alt="Workload Manager" width="300"/>
      <br><strong>Workload Manager</strong>
    </td>
    <td align="center">
      <img src="RAG3.png" alt="Cost Optimizer" width="300"/>
      <br><strong>Cost Optimizer</strong>
    </td>
  </tr>
  <tr>
    <td align="center">
      <img src="RAG4.png" alt="Monitoring Dashboard" width="300"/>
      <br><strong>Monitoring Dashboard</strong>
    </td>
    <td align="center">
      <img src="RAG5.png" alt="AI Knowledge Assistant" width="300"/>
      <br><strong>AI Knowledge Assistant</strong>
    </td>
    <td align="center">
      <img src="RAG6.png" alt="System Architecture" width="300"/>
      <br><strong>System Architecture</strong>
    </td>
  </tr>
  <tr>
    <td align="center"></td>
    <td align="center"></td>
    <td align="center"></td>
  </tr>
</table>

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

## 🛠️ Tech Stack Details

**Frontend:**
- React 18 - Modern React with hooks and functional components
- Tailwind CSS - Utility-first CSS framework
- Framer Motion - Production-ready motion library
- Recharts - Composable charting library
- Axios - Promise-based HTTP client

**Backend:**
- Node.js - JavaScript runtime
- Netlify Functions - Serverless backend functions
- Serverless Architecture - Scalable cloud infrastructure

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
