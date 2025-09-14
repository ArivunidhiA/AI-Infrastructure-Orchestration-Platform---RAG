# AI Infrastructure Orchestration Platform

## 🌐 **Live Demo**
**[https://ai-infrastructure-with-rag.netlify.app/](https://ai-infrastructure-with-rag.netlify.app/)**

![Dashboard Overview](RAG1.png)
![Workload Manager](RAG2.png)
![Cost Optimizer](RAG3.png)
![Monitoring Dashboard](RAG4.png)
![AI Knowledge Assistant](RAG5.png)
![System Architecture](RAG6.png)

A comprehensive platform for managing AI workloads, monitoring resources, optimizing costs, and providing intelligent knowledge assistance through RAG (Retrieval Augmented Generation) technology.

## 🚀 **Netlify Deployment Ready**

This project is optimized for **Netlify deployment** with a clean, simplified structure.

## ✨ Features

### Core Infrastructure Management
- **Workload Management**: Create, monitor, and manage AI training and inference workloads
- **Resource Monitoring**: Real-time CPU, GPU, and memory usage tracking
- **Cost Optimization**: Intelligent recommendations for reducing infrastructure costs
- **Performance Analytics**: Comprehensive performance metrics and trend analysis

### AI-Powered Knowledge Assistant
- **RAG System**: Advanced Retrieval Augmented Generation for intelligent assistance
- **Document Search**: Search through technical documentation and best practices
- **Smart Recommendations**: AI-driven suggestions for infrastructure optimization
- **Contextual Help**: Get help based on your current workload and configuration

### Modern UI/UX
- **Futuristic Design**: Dark theme with glassmorphism effects and glowing elements
- **Interactive Dashboards**: Real-time data visualization with smooth animations
- **Responsive Layout**: Works perfectly on desktop, tablet, and mobile devices
- **Smooth Animations**: Framer Motion powered transitions and micro-interactions

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern React with hooks and functional components
- **Tailwind CSS** - Utility-first CSS framework for rapid UI development
- **Framer Motion** - Production-ready motion library for React
- **Recharts** - Composable charting library built on React and D3
- **Lucide React** - Beautiful & consistent icon toolkit
- **React Hot Toast** - Toast notifications for better UX
- **Axios** - Promise-based HTTP client

### Backend (Netlify Functions)
- **Node.js** - JavaScript runtime for serverless functions
- **Netlify Functions** - Serverless backend functions
- **Mock Data** - Realistic sample data for demonstration

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- npm or yarn
- Netlify account (for deployment)

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/ArivunidhiA/AI-Infrastructure-Orchestration-Platform---RAG.git
   cd AI-Infrastructure-Orchestration-Platform---RAG
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - API: http://localhost:8888/api (when using Netlify CLI)

### Netlify Deployment

1. **Connect to Netlify**
   - Go to [netlify.com](https://netlify.com)
   - Click "New site from Git"
   - Connect your GitHub repository

2. **Deploy settings**
   - Build command: `npm run build`
   - Publish directory: `frontend/build`
   - Base directory: `frontend`

3. **Deploy!**
   - Click "Deploy site"
   - Your app will be live in minutes!

## 📁 Project Structure

```
ai-infrastructure-platform/
├── frontend/                 # React frontend application
│   ├── public/              # Static assets
│   ├── src/                 # Source code
│   │   ├── components/      # React components
│   │   ├── services/        # API services
│   │   └── App.js          # Main app component
│   ├── package.json        # Frontend dependencies
│   └── build/              # Production build (generated)
├── netlify/                # Netlify Functions
│   └── functions/          # Serverless backend functions
│       └── api.js          # Main API function
├── netlify.toml            # Netlify configuration
├── package.json            # Root package.json
└── README.md              # This file
```

## 🎯 Key Features Explained

### Modern UI/UX Features
- **Glassmorphism Design**: Translucent panels with blur effects and subtle borders
- **Gradient Text**: Eye-catching headings with gradient color schemes
- **Glowing Effects**: Neon-style borders and shadows on interactive elements
- **Smooth Animations**: Page transitions and hover effects powered by Framer Motion
- **Interactive Charts**: Real-time data visualization with Recharts
- **Responsive Design**: Mobile-first approach with Tailwind CSS

### RAG System Features
- **Document Processing**: Upload and process technical documentation
- **Semantic Search**: Find relevant information using vector similarity
- **Contextual Responses**: AI-generated responses based on your infrastructure
- **Knowledge Base**: Built-in knowledge about AI infrastructure best practices

### Monitoring & Analytics
- **Real-time Metrics**: Live CPU, GPU, and memory usage tracking
- **Performance Trends**: Historical data analysis and trend visualization
- **Cost Tracking**: Monitor and optimize infrastructure costs
- **Smart Alerts**: Automated notifications for resource usage and optimization opportunities

## 🔧 Configuration

### Environment Variables
- `REACT_APP_API_URL`: API base URL (defaults to `/api` for Netlify)

### Netlify Functions
The backend is implemented as Netlify Functions in `netlify/functions/api.js`:
- Handles all API endpoints
- Provides mock data for demonstration
- Includes CORS headers for cross-origin requests
- Supports all CRUD operations for workloads and metrics

## 🚀 Deployment

### Netlify (Recommended)
1. Connect your GitHub repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `frontend/build`
4. Deploy!

### Other Platforms
- **Vercel**: Works with minimal configuration
- **GitHub Pages**: Static hosting for frontend only
- **AWS S3 + CloudFront**: For enterprise deployments

## 📊 Sample Data

The application includes realistic sample data for:
- **Workloads**: Various AI model workloads with different resource requirements
- **Metrics**: CPU, memory, and GPU usage data
- **Performance**: Historical performance trends and cost data
- **Recommendations**: AI-generated optimization suggestions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- React team for the amazing framework
- Tailwind CSS for the utility-first approach
- Framer Motion for smooth animations
- Netlify for excellent hosting and serverless functions
- The open-source community for inspiration and tools

---

**Built with ❤️ for the AI Infrastructure community**