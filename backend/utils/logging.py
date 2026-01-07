"""Structured logging with CloudWatch integration"""
import logging
import json
import boto3
from datetime import datetime
from typing import Optional
from backend.config.settings import get_settings

settings = get_settings()

# Initialize CloudWatch Logs client
cloudwatch_logs_client = None
if settings.enable_cloudwatch:
    try:
        cloudwatch_logs_client = boto3.client(
            'logs',
            region_name=settings.aws_region,
            aws_access_key_id=settings.aws_access_key_id,
            aws_secret_access_key=settings.aws_secret_access_key
        )
    except Exception as e:
        print(f"Error initializing CloudWatch: {e}")


class CloudWatchHandler(logging.Handler):
    """Custom logging handler for CloudWatch"""
    
    def __init__(self, log_group_name: str):
        super().__init__()
        self.logs_client = cloudwatch_logs_client
        self.log_group = log_group_name
        self.log_stream = datetime.now().strftime('%Y-%m-%d')
        self._ensure_log_group()
        self._buffer = []
    
    def _ensure_log_group(self):
        """Create log group if it doesn't exist"""
        if not self.logs_client:
            return
        
        try:
            self.logs_client.create_log_group(logGroupName=self.log_group)
        except self.logs_client.exceptions.ResourceAlreadyExistsException:
            pass
        except Exception as e:
            print(f"Error creating log group: {e}")
    
    def emit(self, record):
        """Emit log record to CloudWatch"""
        if not self.logs_client:
            return
        
        try:
            log_entry = {
                'timestamp': int(record.created * 1000),
                'message': self.format(record),
                'level': record.levelname,
                'module': record.module,
                'function': record.funcName,
                'line': record.lineno
            }
            
            self._buffer.append({
                'timestamp': int(record.created * 1000),
                'message': json.dumps(log_entry)
            })
            
            # Flush buffer if it gets too large
            if len(self._buffer) >= 10:
                self._flush_buffer()
        except Exception:
            self.handleError(record)
    
    def _flush_buffer(self):
        """Flush log buffer to CloudWatch"""
        if not self._buffer or not self.logs_client:
            return
        
        try:
            self.logs_client.put_log_events(
                logGroupName=self.log_group,
                logStreamName=self.log_stream,
                logEvents=self._buffer
            )
            self._buffer = []
        except Exception as e:
            print(f"Error flushing logs to CloudWatch: {e}")


def setup_logging():
    """Setup structured logging with CloudWatch"""
    logger = logging.getLogger('ai-platform')
    logger.setLevel(getattr(logging, settings.log_level.upper(), logging.INFO))
    
    # Clear existing handlers
    logger.handlers = []
    
    # Console handler
    console_handler = logging.StreamHandler()
    console_handler.setFormatter(
        logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    )
    logger.addHandler(console_handler)
    
    # CloudWatch handler (if enabled)
    if settings.enable_cloudwatch and cloudwatch_logs_client:
        cw_handler = CloudWatchHandler(settings.cloudwatch_log_group)
        cw_handler.setFormatter(
            logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
        )
        logger.addHandler(cw_handler)
    
    return logger

