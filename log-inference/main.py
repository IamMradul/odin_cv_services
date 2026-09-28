import os
from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from dotenv import load_dotenv

from log_engine import LogEngine
from llm_client import LLMClient

load_dotenv()

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Odin-CV Log Inference")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)# Initialize components
LOG_PATH = os.getenv("LOG_FILE_PATH", "../../data/all_logs.json")
# ensure absolute path for robustness if running from different dir
if not os.path.isabs(LOG_PATH):
    LOG_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), LOG_PATH))

engine = LogEngine(LOG_PATH)
llm = LLMClient()

class QueryRequest(BaseModel):
    question: str

@app.get("/", response_class=HTMLResponse)
async def get_ui():
    index_path = os.path.join(os.path.dirname(__file__), "index.html")
    with open(index_path, 'r', encoding='utf-8') as f:
        return f.read()

@app.post("/query")
async def query_logs(req: QueryRequest):
    if engine.events_df.empty and engine.alerts_df.empty:
        return JSONResponse({"answer": "No log data available to analyze.", "context": ""})
        
    context = engine.generate_analytics_context()
    answer = llm.query(req.question, context)
    
    return JSONResponse({
        "answer": answer,
        "context_used": context
    })

@app.get("/reload")
async def reload_logs():
    engine.reload_data()
    return {"status": "ok", "message": f"Reloaded data. Events: {len(engine.events_df)}, Alerts: {len(engine.alerts_df)}"}

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 7860))
    print(f"Starting server on port {port}")
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
