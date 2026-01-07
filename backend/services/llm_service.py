"""LLM service using AWS Bedrock or OpenAI"""
import json
import boto3
from typing import Optional, List
from backend.config.settings import get_settings

settings = get_settings()

# Try to import OpenAI
OPENAI_AVAILABLE = False
try:
    import openai
    OPENAI_AVAILABLE = True
except ImportError:
    pass

# Initialize Bedrock client (only if needed)
bedrock_client = None
if settings.use_bedrock and settings.aws_access_key_id:
    try:
        bedrock_client = boto3.client(
            'bedrock-runtime',
            region_name=settings.bedrock_region,
            aws_access_key_id=settings.aws_access_key_id,
            aws_secret_access_key=settings.aws_secret_access_key
        )
    except Exception as e:
        print(f"Error initializing Bedrock client: {e}")

# Initialize OpenAI client (only if needed)
openai_client = None
if settings.use_openai and OPENAI_AVAILABLE and settings.openai_api_key:
    try:
        from openai import OpenAI
        openai_client = OpenAI(api_key=settings.openai_api_key)
    except Exception as e:
        print(f"Error initializing OpenAI client: {e}")


class LLMService:
    """Service for LLM operations using AWS Bedrock or OpenAI"""
    
    def __init__(self):
        self.bedrock_client = bedrock_client
        self.openai_client = openai_client
        self.bedrock_model_id = settings.bedrock_model_id
        self.bedrock_embedding_model = settings.bedrock_embedding_model
        self.openai_model = settings.openai_model
        self.openai_embedding_model = settings.openai_embedding_model
        self.use_bedrock = settings.use_bedrock and bedrock_client is not None
        self.use_openai = settings.use_openai and OPENAI_AVAILABLE and openai_client is not None
    
    def generate_embedding(self, text: str) -> List[float]:
        """Generate embedding using OpenAI or Bedrock Titan"""
        # Try OpenAI first if available
        if self.use_openai:
            try:
                response = self.openai_client.embeddings.create(
                    model=self.openai_embedding_model,
                    input=text
                )
                return response.data[0].embedding
            except Exception as e:
                print(f"Error generating embedding with OpenAI: {e}")
                # Fall through to Bedrock or simple embedding
        
        # Try Bedrock if available
        if self.use_bedrock:
            try:
                response = self.bedrock_client.invoke_model(
                    modelId=self.bedrock_embedding_model,
                    body=json.dumps({'inputText': text})
                )
                response_body = json.loads(response['body'].read())
                return response_body['embedding']
            except Exception as e:
                print(f"Error generating embedding with Bedrock: {e}")
                return self._simple_embedding(text)
        
        # Fallback to simple embedding
        return self._simple_embedding(text)
    
    def _simple_embedding(self, text: str) -> List[float]:
        """Simple fallback embedding"""
        import hashlib
        hash_obj = hashlib.md5(text.encode())
        hash_hex = hash_obj.hexdigest()
        return [float(int(hash_hex[i:i+2], 16)) / 255.0 for i in range(0, min(32, len(hash_hex)), 2)] * 48
    
    def generate_response(self, prompt: str, max_tokens: int = 500) -> str:
        """Generate response using OpenAI or Bedrock Claude"""
        # Try OpenAI first if available
        if self.use_openai:
            try:
                response = self.openai_client.chat.completions.create(
                    model=self.openai_model,
                    messages=[
                        {"role": "system", "content": "You are a helpful AI assistant specializing in AI infrastructure, workload management, and optimization."},
                        {"role": "user", "content": prompt}
                    ],
                    max_tokens=max_tokens,
                    temperature=0.7
                )
                return response.choices[0].message.content.strip()
            except Exception as e:
                print(f"Error calling OpenAI: {e}")
                # Fall through to Bedrock or template response
        
        # Try Bedrock if available
        if self.use_bedrock:
            try:
                # Format prompt for Claude
                claude_prompt = f"Human: {prompt}\n\nAssistant:"
                
                response = self.bedrock_client.invoke_model(
                    modelId=self.bedrock_model_id,
                    body=json.dumps({
                        "prompt": claude_prompt,
                        "max_tokens_to_sample": max_tokens,
                        "temperature": 0.7
                    })
                )
                
                response_body = json.loads(response['body'].read())
                return response_body['completion']
            except Exception as e:
                print(f"Error calling Bedrock: {e}")
                return self._template_response(prompt)
        
        # Fallback to template response
        return self._template_response(prompt)
    
    def _template_response(self, prompt: str) -> str:
        """Fallback template-based response"""
        # Simple template responses for demo
        if "optimize" in prompt.lower() or "cost" in prompt.lower():
            return "To optimize costs, consider using spot instances, right-sizing your resources, and implementing auto-scaling based on demand. Monitor your usage patterns and adjust resources accordingly."
        elif "gpu" in prompt.lower():
            return "To optimize GPU usage, consider using mixed precision training, implementing gradient accumulation, and monitoring GPU memory utilization. Use tools like NVIDIA-SMI to track GPU performance."
        elif "memory" in prompt.lower():
            return "For high memory usage issues, check for memory leaks in your applications. Use profiling tools to identify memory bottlenecks. Consider implementing memory pooling and garbage collection optimization."
        else:
            return "Based on your question, I recommend reviewing your infrastructure configuration and monitoring metrics. Please check the documentation for more specific guidance."

