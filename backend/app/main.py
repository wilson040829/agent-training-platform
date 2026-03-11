from fastapi import FastAPI
from app.api.v1.agent import router as agent_router

app = FastAPI(title="Agent Training Platform API", version="0.1.0")
app.include_router(agent_router, prefix="/api/v1")

@app.get("/health")
def health():
    return {"ok": True}
