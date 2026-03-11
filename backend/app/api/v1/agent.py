from fastapi import APIRouter
from uuid import uuid4
from app.schemas.agent import AgentCreate, AgentOut

router = APIRouter(tags=["agent"])
_FAKE_DB = []

@router.post("/agents", response_model=AgentOut)
def create_agent(payload: AgentCreate):
    item = AgentOut(id=str(uuid4()), **payload.model_dump())
    _FAKE_DB.append(item)
    return item

@router.get("/agents")
def list_agents():
    return _FAKE_DB
