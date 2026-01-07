"""LLM service using AWS Bedrock"""
import json
import boto3
from typing import Optional, List
from backend.config.settings import get_settings

settings = get_settings()

# Initialize Bedrock client
bedrock_client = boto3.client(
    'bedrock-runtime',
    region_name=settings.bedrock_region,
    aws_access_key_id=settings.aws_access_key_id,
    aws_secret_access_key=settings.aws_secret_access_key
)


class LLMService:
    """Service for LLM operations using AWS Bedrock"""
    
    def __init__(self):
        self.client = bedrock_client
        self.model_id = settings.bedrock_model_id
        self.embedding_model = settings.bedrock_embedding_model
        self.use_bedrock = settings.use_bedrock
    
    def generate_embedding(self, text: str) -> List[float]:
        """Generate embedding using Bedrock Titan"""
        if not self.use_bedrock:
            return self._simple_embedding(text)
        
        try:
            response = self.client.invoke_model(
                modelId=self.embedding_model,
                body=json.dumps({'inputText': text})
            )
            response_body = json.loads(response['body'].read())
            return response_body['embedding']
        except Exception as e:
            print(f"Error generating embedding with Bedrock: {e}")
            return self._simple_embedding(text)
    
    def _simple_embedding(self, text: str) -> List[float]:
        """Simple fallback embedding"""
        import hashlib
        hash_obj = hashlib.md5(text.encode())
        hash_hex = hash_obj.hexdigest()
        return [float(int(hash_hex[i:i+2], 16)) / 255.0 for i in range(0, min(32, len(hash_hex)), 2)] * 48
    
    def generate_response(self, prompt: str, max_tokens: int = 1000) -> str:
        """Generate response using Bedrock Claude"""
        if not self.use_bedrock:
            return self._template_response(prompt)
        
        try:
            # Format prompt for Claude
            claude_prompt = f"Human: {prompt}\n\nAssistant:"
            
            response = self.client.invoke_model(
                modelId=self.model_id,
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

