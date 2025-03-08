import logging
import sys
import csv
from datetime import datetime
import os

from app.schema.log import LogModel

def get_csv_filename(date):
    week = date.isocalendar()[1]
    year = date.year
    return os.path.join("app/logs", f"log_week_{week}_{year}.csv")

def write_log(
    request: LogModel
):
    curr_date = datetime.now()
    filename = get_csv_filename(curr_date)
    
    if not os.path.exists(filename):
        with open(filename, mode='a', newline='', encoding='utf-8') as file:
            writer = csv.writer(file)
            writer.writerow(
                [
                    "action_datetime", "path_name", "method", "ip", 
                "status_response", "response", "description", "request_body", 
                "request_query", "duration"
                ]
            )
    
    with open(filename, mode='a', newline='', encoding='utf-8') as file:
        writer = csv.writer(file)
        writer.writerow([
            request.action_date.strftime("%Y-%m-%d %H:%M:%S"), 
            request.path_name, 
            request.method, 
            request.ip, 
            request.status_response, 
            request.response, 
            request.description, 
            request.request_body, 
            request.request_query, 
            request.duration
        ])