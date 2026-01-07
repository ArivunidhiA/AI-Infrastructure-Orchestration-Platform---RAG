"""DynamoDB service wrapper for common operations"""
from typing import Dict, Any, List, Optional
from backend.database import get_table, dynamodb_client
from botocore.exceptions import ClientError


class DynamoDBService:
    """Service wrapper for DynamoDB operations"""
    
    @staticmethod
    def get_item(table_name: str, key: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Get a single item from DynamoDB"""
        try:
            table = get_table(table_name)
            response = table.get_item(Key=key)
            return response.get('Item')
        except ClientError as e:
            print(f"Error getting item from {table_name}: {e}")
            return None
    
    @staticmethod
    def put_item(table_name: str, item: Dict[str, Any]) -> bool:
        """Put an item into DynamoDB"""
        try:
            table = get_table(table_name)
            table.put_item(Item=item)
            return True
        except ClientError as e:
            print(f"Error putting item to {table_name}: {e}")
            return False
    
    @staticmethod
    def update_item(
        table_name: str,
        key: Dict[str, Any],
        update_expression: str,
        expression_attribute_values: Dict[str, Any],
        expression_attribute_names: Optional[Dict[str, Any]] = None
    ) -> Optional[Dict[str, Any]]:
        """Update an item in DynamoDB"""
        try:
            table = get_table(table_name)
            kwargs = {
                'Key': key,
                'UpdateExpression': update_expression,
                'ExpressionAttributeValues': expression_attribute_values,
                'ReturnValues': 'ALL_NEW'
            }
            if expression_attribute_names:
                kwargs['ExpressionAttributeNames'] = expression_attribute_names
            
            response = table.update_item(**kwargs)
            return response.get('Attributes')
        except ClientError as e:
            print(f"Error updating item in {table_name}: {e}")
            return None
    
    @staticmethod
    def delete_item(table_name: str, key: Dict[str, Any]) -> bool:
        """Delete an item from DynamoDB"""
        try:
            table = get_table(table_name)
            table.delete_item(Key=key)
            return True
        except ClientError as e:
            print(f"Error deleting item from {table_name}: {e}")
            return False
    
    @staticmethod
    def query(
        table_name: str,
        key_condition_expression: str,
        expression_attribute_values: Dict[str, Any],
        index_name: Optional[str] = None,
        limit: Optional[int] = None,
        scan_index_forward: bool = True
    ) -> List[Dict[str, Any]]:
        """Query items from DynamoDB"""
        try:
            table = get_table(table_name)
            kwargs = {
                'KeyConditionExpression': key_condition_expression,
                'ExpressionAttributeValues': expression_attribute_values
            }
            if index_name:
                kwargs['IndexName'] = index_name
            if limit:
                kwargs['Limit'] = limit
            kwargs['ScanIndexForward'] = scan_index_forward
            
            response = table.query(**kwargs)
            return response.get('Items', [])
        except ClientError as e:
            print(f"Error querying {table_name}: {e}")
            return []
    
    @staticmethod
    def scan(
        table_name: str,
        filter_expression: Optional[str] = None,
        expression_attribute_values: Optional[Dict[str, Any]] = None,
        limit: Optional[int] = None
    ) -> List[Dict[str, Any]]:
        """Scan items from DynamoDB"""
        try:
            table = get_table(table_name)
            kwargs = {}
            if filter_expression:
                kwargs['FilterExpression'] = filter_expression
            if expression_attribute_values:
                kwargs['ExpressionAttributeValues'] = expression_attribute_values
            if limit:
                kwargs['Limit'] = limit
            
            response = table.scan(**kwargs)
            return response.get('Items', [])
        except ClientError as e:
            print(f"Error scanning {table_name}: {e}")
            return []
    
    @staticmethod
    def batch_write(table_name: str, items: List[Dict[str, Any]]) -> bool:
        """Batch write items to DynamoDB"""
        try:
            table = get_table(table_name)
            with table.batch_writer() as batch:
                for item in items:
                    batch.put_item(Item=item)
            return True
        except ClientError as e:
            print(f"Error batch writing to {table_name}: {e}")
            return False

