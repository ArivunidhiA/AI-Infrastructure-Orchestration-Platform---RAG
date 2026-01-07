import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Upload, 
  FileText, 
  MessageSquare, 
  Search,
  Download,
  Trash2,
  Plus,
  Bot,
  User,
  BookOpen,
  Lightbulb,
  Clock,
  CheckCircle
} from 'lucide-react';
import { ragAPI } from '../services/api';
import { apiUtils } from '../services/api';
import toast from 'react-hot-toast';
import { Button } from './ui/neon-button';
import { GlowCard } from './ui/spotlight-card';

const RAGAssistant = () => {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [suggestedQuestions, setSuggestedQuestions] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [showUpload, setShowUpload] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [activeTab, setActiveTab] = useState('chat');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchInitialData = async () => {
    try {
      const [questionsResponse, documentsResponse] = await Promise.all([
        ragAPI.getSuggestedQuestions(),
        ragAPI.getDocuments()
      ]);
      
      // Handle different response structures - APIs return data directly
      console.log('RAG API responses:', { questionsResponse, documentsResponse });
      const questionsData = questionsResponse.data || questionsResponse;
      const documentsData = documentsResponse.data || documentsResponse;
      
      // Extract suggested questions - handle both direct array and nested object
      let questions = [];
      if (Array.isArray(questionsData)) {
        questions = questionsData;
      } else if (questionsData.suggested_questions && Array.isArray(questionsData.suggested_questions)) {
        questions = questionsData.suggested_questions;
      } else if (questionsData.data && Array.isArray(questionsData.data.suggested_questions)) {
        questions = questionsData.data.suggested_questions;
      }
      
      setSuggestedQuestions(questions);
      setDocuments(Array.isArray(documentsData.documents) ? documentsData.documents : Array.isArray(documentsData) ? documentsData : []);
    } catch (error) {
      console.error('Error fetching initial data:', error);
      // Set fallback data
      setSuggestedQuestions([
        "What are the workloads we have now?",
        "How can I optimize my GPU usage?",
        "What are the best practices for cost management?",
        "How do I troubleshoot high memory usage?",
        "What is auto-scaling and how does it work?",
        "How can I improve my model performance?",
        "What is the current infrastructure setup?",
        "How much are we spending on workloads monthly?"
      ]);
      setDocuments([]);
    }
  };

  const handleQuery = async (e) => {
    e.preventDefault();
    if (!query.trim() || loading) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: query,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setQuery('');
    setLoading(true);

    try {
      const response = await ragAPI.queryRAG(query);
      const assistantMessage = {
        id: response.data.id,
        type: 'assistant',
        content: response.data.answer,
        sources: response.data.sources || [],
        confidence: response.data.confidence_score,
        timestamp: response.data.created_at
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        type: 'assistant',
        content: 'Sorry, I encountered an error while processing your question. Please try again.',
        error: true,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
      toast.error('Failed to get response');
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestedQuestion = (question) => {
    setQuery(question);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.txt') && !file.name.endsWith('.md')) {
      toast.error('Only .txt and .md files are supported');
      return;
    }

    setUploadFile(file);
    setLoading(true);

    try {
      const response = await ragAPI.uploadDocument(file);
      if (response.data.success) {
        toast.success('Document uploaded successfully');
        fetchInitialData();
        setShowUpload(false);
        setUploadFile(null);
      } else {
        toast.error(response.data.message || 'Upload failed');
      }
    } catch (error) {
      toast.error('Failed to upload document');
      console.error('Error uploading document:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      const response = await ragAPI.searchDocuments(searchQuery);
      setSearchResults(response.data.results || []);
    } catch (error) {
      toast.error('Search failed');
      console.error('Error searching documents:', error);
    }
  };

  const handleDeleteDocument = async (documentId) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      try {
        await ragAPI.deleteDocument(documentId);
        toast.success('Document deleted successfully');
        fetchInitialData();
      } catch (error) {
        toast.error('Failed to delete document');
        console.error('Error deleting document:', error);
      }
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  const getConfidenceColor = (confidence) => {
    if (confidence > 0.8) return 'text-white/80';
    if (confidence > 0.6) return 'text-white/70';
    return 'text-white/60';
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-5xl md:text-6xl md:leading-16 tracking-tight font-light text-white mb-2">
            <span className="font-medium italic instrument">AI Knowledge Assistant</span>
          </h1>
          <p className="text-xs font-light text-white/70 leading-relaxed">Ask questions about your infrastructure and get intelligent answers</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            onClick={() => setShowUpload(true)}
            variant="default"
            className="flex items-center space-x-2"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Document</span>
          </Button>
          <Button
            onClick={clearChat}
            variant="default"
            className="flex items-center space-x-2"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear Chat</span>
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-800/50 p-1 rounded-lg">
        {[
          { id: 'chat', label: 'Chat', icon: MessageSquare },
          { id: 'documents', label: 'Documents', icon: FileText },
          { id: 'search', label: 'Search', icon: Search }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-md transition-all duration-300 ${
                activeTab === tab.id
                  ? 'bg-white/10 text-white border border-white/20'
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Chat Tab */}
      {activeTab === 'chat' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Chat Area */}
          <div className="lg:col-span-3">
            <GlowCard glowColor="white" customSize className="w-full h-[600px] flex flex-col p-0">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {messages.length === 0 ? (
                      <div className="text-center py-12">
                        <Bot className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-white mb-2">Welcome to AI Assistant</h3>
                        <p className="text-gray-400 mb-6">Ask me anything about your infrastructure setup, optimization, or troubleshooting</p>
                      </div>
                    ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-3xl ${message.type === 'user' ? 'rag-user' : 'rag-assistant'}`}>
                        <div className={`flex items-start space-x-3 ${
                          message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                        }`}>
                          <div className="p-2 rounded-lg bg-white/10 flex-shrink-0">
                            {message.type === 'user' ? (
                              <User className="w-4 h-4 text-white" />
                            ) : (
                              <Bot className="w-4 h-4 text-white" />
                            )}
                          </div>
                          
                          <div className={`flex-1 ${message.type === 'user' ? 'text-right' : ''}`}>
                            <div className={`flex items-center space-x-2 mb-2 ${message.type === 'user' ? 'justify-end' : ''}`}>
                              <span className="text-sm font-medium text-white/90">
                                {message.type === 'user' ? 'You' : 'AI Assistant'}
                              </span>
                              {message.confidence && message.type === 'assistant' && (
                                <span className={`text-xs ${getConfidenceColor(message.confidence)}`}>
                                  {apiUtils.formatPercentage(message.confidence * 100)} confidence
                                </span>
                              )}
                            </div>
                            
                            <div className={`rounded-lg p-3 ${
                              message.type === 'user' 
                                ? 'bg-white/5 border border-white/10' 
                                : 'bg-white/5 border border-white/10'
                            }`}>
                              <p className="text-white/90 whitespace-pre-wrap leading-relaxed">{message.content}</p>
                            </div>
                            
                            {message.sources && message.sources.length > 0 && (
                              <div className="mt-3 p-3 bg-white/5 rounded-lg border border-white/10">
                                <p className="text-xs text-white/60 mb-2">Sources:</p>
                                <div className="space-y-1">
                                  {message.sources.map((source, index) => (
                                    <div key={index} className="text-xs text-white/70">
                                      • {source.title} ({source.doc_type})
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            <p className="text-xs text-white/40 mt-2">
                              {apiUtils.formatRelativeTime(message.timestamp)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
                
                {loading && (
                  <div className="flex justify-start">
                    <div className="max-w-3xl">
                      <div className="flex items-start space-x-3">
                        <div className="p-2 rounded-lg bg-white/10">
                          <Bot className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1">
                          <span className="text-sm font-medium text-white/90 mb-2 block">AI Assistant</span>
                          <div className="rounded-lg p-3 bg-white/5 border border-white/10">
                            <div className="flex items-center space-x-2">
                              <div className="spinner"></div>
                              <span className="text-white/70">Thinking...</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
              
              {/* Input */}
              <div className="p-6 border-t border-gray-700/50">
                <form onSubmit={handleQuery} className="flex space-x-3">
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Ask about infrastructure, optimization, troubleshooting..."
                    className="flex-1 input-field"
                    disabled={loading}
                  />
                  <button
                    type="submit"
                    disabled={!query.trim() || loading}
                    className="btn-primary px-6 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </GlowCard>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Suggested Questions */}
            <GlowCard glowColor="white" customSize className="w-full h-auto p-4">
              <h3 className="text-sm font-semibold text-white mb-3 flex items-center">
                <Lightbulb className="w-4 h-4 mr-2" />
                Suggested Questions
              </h3>
              <div className="space-y-2">
                {Array.isArray(suggestedQuestions) ? suggestedQuestions.slice(0, 5).map((question, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestedQuestion(question)}
                    className="block w-full text-left p-2 text-xs text-gray-300 hover:text-white hover:bg-gray-800/50 rounded transition-colors"
                  >
                    {question}
                  </button>
                )) : []}
              </div>
            </GlowCard>

            {/* Quick Stats */}
            <GlowCard glowColor="white" customSize className="w-full h-auto p-4">
              <h3 className="text-sm font-semibold text-white mb-3 flex items-center">
                <BookOpen className="w-4 h-4 mr-2" />
                Knowledge Base
              </h3>
              <div className="space-y-2 text-xs text-gray-400">
                <div className="flex justify-between">
                  <span>Documents:</span>
                  <span className="text-white">{documents.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Questions Asked:</span>
                  <span className="text-white">{messages.filter(m => m.type === 'user').length}</span>
                </div>
              </div>
            </GlowCard>
          </div>
        </div>
      )}

      {/* Documents Tab */}
      {activeTab === 'documents' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Knowledge Base Documents</h3>
            <button
              onClick={() => setShowUpload(true)}
              className="btn-primary flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Document</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.isArray(documents) ? documents.map((doc) => (
              <GlowCard
                key={doc.id}
                glowColor="white"
                customSize
                className="w-full h-auto p-4"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-5 h-5 text-white" />
                    <span className="text-xs text-white/70 capitalize">{doc.doc_type}</span>
                  </div>
                  <button
                    onClick={() => handleDeleteDocument(doc.id)}
                    className="text-red-400 hover:text-red-300 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                
                <h4 className="font-medium text-white mb-2">{doc.title}</h4>
                <p className="text-sm text-gray-400 mb-3 line-clamp-3">
                  {doc.content.substring(0, 100)}...
                </p>
                
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{apiUtils.formatRelativeTime(doc.upload_date)}</span>
                  <span>{doc.content.length} chars</span>
                </div>
              </GlowCard>
            )) : (
              <div className="col-span-full text-center py-12">
                <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No documents found</p>
                <p className="text-sm text-gray-500 mt-1">Upload your first document to get started</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Search Tab */}
      {activeTab === 'search' && (
        <div className="space-y-6">
          <GlowCard glowColor="white" customSize className="w-full h-auto p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Search Knowledge Base</h3>
            
            <form onSubmit={handleSearch} className="flex space-x-3 mb-6">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search documents..."
                className="flex-1 input-field"
              />
              <button type="submit" className="btn-primary px-6">
                <Search className="w-4 h-4" />
              </button>
            </form>

            {searchResults.length > 0 && (
              <div className="space-y-4">
                <p className="text-sm text-gray-400">
                  Found {searchResults.length} results for "{searchQuery}"
                </p>
                {searchResults.map((result, index) => (
                  <div
                    key={index}
                    className="p-4 bg-gray-800/30 rounded-lg border border-gray-700/50"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-white">{result.title}</h4>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-400 capitalize">{result.doc_type}</span>
                        <span className="text-xs text-white/70">
                          {apiUtils.formatPercentage(result.similarity_score * 100)} match
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-300 mb-2">{result.content_preview}</p>
                    <p className="text-xs text-gray-500">
                      Uploaded {apiUtils.formatRelativeTime(result.upload_date)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </GlowCard>
        </div>
      )}

      {/* Upload Modal */}
      {showUpload && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <GlowCard glowColor="white" customSize className="w-full max-w-md p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Upload Document</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Select File
                </label>
                <input
                  type="file"
                  accept=".txt,.md"
                  onChange={handleFileUpload}
                  className="input-field"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Only .txt and .md files are supported
                </p>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowUpload(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </div>
          </GlowCard>
        </div>
      )}
    </div>
  );
};

export default RAGAssistant;
