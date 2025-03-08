
from datetime import datetime
import json
import logging
import sys
from fastapi import BackgroundTasks, HTTPException, Request, Response, status

from fastapi.responses import JSONResponse
from requests import Session
from starlette.middleware.base import BaseHTTPMiddleware

from app.constant.log import LENGTH_MAX_RESPONSE
from app.schema.log import LogModel
from app.utils.logger import write_log

#get logger 
logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

class APIGatewayMiddleware(BaseHTTPMiddleware):
    def print_log_request(self, 
        request : Request, 
        request_body, 
        original_path, 
        start_time
    ):
        formatted_time = datetime.fromtimestamp(start_time)
        formatted_time = formatted_time.strftime('%Y-%m-%d %H:%M:%S')
        logger.info(
            f"\nREQUEST\n"
            f"\nStart time: {formatted_time}"
            f"\n{request.method} request to {request.url} metadata\n"
            f"\tBody: {request_body}\n"
            f"\tPath Params: {request.path_params}\n"
            f"\tQuery Params: {request.query_params}\n"
            f"\tOriginal path: {original_path}\n"
        )
    
    def get_ip(self, request: Request) -> str:
        headers_to_check = [
            "X-Forwarded-For",
            "X-Real-IP"
        ]
        for header in headers_to_check:
            if header in request.headers:
                return request.headers[header].split(",")[0].strip()
        return request.client.host # falls back to the IP of the immediate client (might be proxy)
    
    def write_log(self,
        request: Request,
        request_body: str,
        original_path: str,
        status_code: int,
        body_str: str,
        process_time: float, 
        error_message = None
    ):
        path_params = request.path_params
        query_params = dict(request.query_params)
        request_params = str({
            "path": path_params,
            "query": query_params
        })
        client_ip = self.get_ip(request=request)
        
        try:
            decoded_request_body = request_body
        except UnicodeDecodeError:
            decoded_request_body = str(request_body)
        log_entry = LogModel(
            action_date= datetime.now(),
            path_name=original_path,
            method=request.method,
            ip = client_ip,
            status_response= status_code,
            response=body_str,
            duration=round(process_time, 3),
            request_body=decoded_request_body,
            request_query = request_params,
            description = None if error_message is None else error_message
        )
        
        write_log(request=log_entry)
        
    def print_log_response(self, status_code:int, response, error_message: str):
        logger.info(
            f"\nRESPONSE \n"
            f"Status Code: {status_code}\n"
            f"Response: {response}\n"
            f"Error message: {error_message}\n"
        )
        
    async def handle_log(self,
        request: Request,
        request_body: str,
        response,
        error_message:str,
        original_path:str,
        start_time, 
        process_time, 
        body_str: str
    ):
        self.print_log_request(
            request=request, 
            request_body=request_body, 
            original_path=original_path, 
            start_time=start_time
        )
        
        self.write_log(
            request=request, 
            request_body=request_body, 
            original_path=original_path, 
            status_code=response.status_code,
            body_str=body_str, 
            process_time=process_time, 
            error_message=error_message
        )
        self.print_log_response(
            status_code=response.status_code, 
            response=body_str[:LENGTH_MAX_RESPONSE], 
            error_message=error_message
        )
    
    async def dispatch(self, request: Request, call_next):
        response_time = 0
        error_message = None
        body_str = str("")
        flag = True
        try:
            original_path = request.url.path
            start_time = datetime.now().timestamp()
            request_body = await request.body()
            response = await call_next(request)
            response_time = datetime.now().timestamp() - start_time
            content_type = request.headers.get('Content-Type', '')
            
            # serialize to JSon string
            if 'application/json' in content_type and request_body:
                try:
                    request_body_json = json.loads(request_body)
                    request_body = json.dumps(request_body_json)
                except json.JSONDecodeError:
                    flag = False
                    response = JSONResponse(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        content={
                            "detail": "Invalid JSON format"
                        }
                    )
        # Catch HTTP exceptions
        except HTTPException as http_exception:
            response = JSONResponse(
                status_code=http_exception.status_code,
                content={"detail": http_exception.detail}
            )
            error_message = None
            flag = False
        # Catch other exception types
        except Exception as e:
            response = JSONResponse(
                status_code= status.HTTP_500_INTERNAL_SERVER_ERROR,
                content={"detail": error_message}
            )
            error_message = str(e)
            flag = False
        finally:
            if flag:
                # retrieves an async body iterator of the response
                body_iterator = response.body_iterator
                response_body = [chunk async for chunk in body_iterator]
                body_str = b"".join(response_body).decode('utf-8', errors='replace')
                response = Response(
                    content = body_str,
                    status_code=response.status_code,
                    headers = dict(response.headers)
                )
            if response.status_code == status.HTTP_500_INTERNAL_SERVER_ERROR:
                error_message = body_str
                body_str = str({
                    "detail": "Internal Server Error"
                })
                response = JSONResponse(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    #content={"detail": "Internal Server Error"}
                    content={"detail": str(response.body)}
                )
            # run background task to write log
            background_tasks = BackgroundTasks() 
            background_tasks.add_task(
                self.handle_log, 
                request,
                request_body,
                response,
                error_message,
                original_path,
                start_time, 
                response_time, 
                body_str
            ) 
            response.background = background_tasks
            return response
            