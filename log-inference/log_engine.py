import json
import pandas as pd
from datetime import datetime
import os

class LogEngine:
    def __init__(self, log_path: str):
        self.log_path = log_path
        self.events_df = pd.DataFrame()
        self.alerts_df = pd.DataFrame()
        self.reload_data()

    def reload_data(self):
        """Reloads and parses the log file into DataFrames."""
        if not os.path.exists(self.log_path):
            print(f"Warning: Log file not found at {self.log_path}")
            return
            
        with open(self.log_path, 'r', encoding='utf-8') as f:
            content = f.read().strip()
            
        decoder = json.JSONDecoder()
        records = []
        pos = 0
        while pos < len(content):
            while pos < len(content) and content[pos] in ' \n\r\t':
                pos += 1
            if pos >= len(content):
                break
            try:
                obj, end_pos = decoder.raw_decode(content, pos)
                records.append(obj)
                pos = end_pos
            except json.JSONDecodeError:
                pos += 1 # skip problematic chars if any
                
        events = [r['data'] for r in records if r.get('table') == 'event_logs']
        alerts = [r['data'] for r in records if r.get('table') == 'object_alerts']
        
        self.events_df = pd.DataFrame(events)
        if not self.events_df.empty and 'timestamp' in self.events_df.columns:
            self.events_df['timestamp'] = pd.to_datetime(self.events_df['timestamp'])
            
        self.alerts_df = pd.DataFrame(alerts)
        if not self.alerts_df.empty and 'timestamp' in self.alerts_df.columns:
            self.alerts_df['timestamp'] = pd.to_datetime(self.alerts_df['timestamp'])

    def generate_analytics_context(self) -> str:
        """Returns a token-efficient CSV summary of recent logs to the LLM."""
        context = "### Recent Event Logs (Last 500)\n"
        if not self.events_df.empty:
            context += self.events_df.tail(500).to_csv(index=False)
        else:
            context += "No events.\n"
            
        context += "\n### Recent Alerts (Last 500)\n"
        if not self.alerts_df.empty:
            context += self.alerts_df.tail(500).to_csv(index=False)
        else:
            context += "No alerts.\n"
            
        return context
