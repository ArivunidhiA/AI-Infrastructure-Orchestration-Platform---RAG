import React from 'react';
import { motion } from 'framer-motion';
import { 
  Server, 
  DollarSign, 
  Activity, 
  MessageSquare,
  Zap,
  Shield,
  BarChart3,
  CheckCircle
} from 'lucide-react';
import { ShaderBackground } from './ui/shaders-hero-section';
import { HoverBorderGradient } from './ui/hover-border-gradient';
import { Button } from './ui/neon-button';

const LandingPage = ({ onEnterDemo }) => {
  const features = [
    {
      icon: Server,
      title: 'Workload Management',
      description: 'Create, monitor, and manage AI training and inference workloads with ease'
    },
    {
      icon: Activity,
      title: 'Resource Monitoring',
      description: 'Real-time CPU, GPU, and memory usage tracking across your infrastructure'
    },
    {
      icon: DollarSign,
      title: 'Cost Optimization',
      description: 'Intelligent recommendations for reducing infrastructure costs'
    },
    {
      icon: BarChart3,
      title: 'Performance Analytics',
      description: 'Comprehensive performance metrics and trend analysis'
    },
    {
      icon: MessageSquare,
      title: 'AI-Powered Assistant',
      description: 'RAG-powered knowledge assistant for intelligent infrastructure guidance'
    },
    {
      icon: Shield,
      title: 'Enterprise-Ready',
      description: 'Multi-tenant support, security, and production-grade architecture'
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <ShaderBackground>
      <div className="min-h-screen flex items-center justify-center p-6 relative z-10">
        <motion.div 
          className="max-w-7xl mx-auto w-full"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Hero Section */}
          <motion.div 
            className="text-center mb-16"
            variants={itemVariants}
          >
            <motion.h1 
              className="text-5xl md:text-6xl md:leading-16 tracking-tight font-light text-white mb-4"
              variants={itemVariants}
            >
              <span className="font-medium italic instrument">AI Infrastructure</span>
              <br />
              <span className="font-light tracking-tight text-white">Orchestration Platform</span>
            </motion.h1>
            
            <motion.p 
              className="text-xs font-light text-white/70 mb-4 leading-relaxed max-w-3xl mx-auto"
              variants={itemVariants}
            >
              A comprehensive platform for managing AI workloads, monitoring resources, 
              optimizing costs, and providing intelligent knowledge assistance through 
              RAG technology.
            </motion.p>

            <motion.div
              variants={itemVariants}
            >
              <Button onClick={onEnterDemo} variant="default">
                Check Demo
              </Button>
            </motion.div>
          </motion.div>

          {/* Features Grid */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12"
            variants={containerVariants}
          >
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div key={index} variants={itemVariants}>
                  <HoverBorderGradient
                    as="div"
                    containerClassName="rounded-2xl"
                    className="bg-transparent"
                  >
                    <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-400 text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </HoverBorderGradient>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Tech Stack Badge */}
          <motion.div 
            className="text-center"
            variants={itemVariants}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-md border border-white/10">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span className="text-sm text-gray-300">
                Powered by AWS • React • FastAPI • RAG Technology
              </span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </ShaderBackground>
  );
};

export default LandingPage;
