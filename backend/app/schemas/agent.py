from pydantic import BaseModel, Field
from typing import List, Literal

class AgentCreate(BaseModel):
    name: str = Field(min_length=2, max_length=50)
    description: str = ""
    persona: Literal["客服专家", "销售顾问", "技术架构师", "数据分析师"]
    system_prompt: str
    model: str = "gpt-4.1-mini"
    temperature: float = 0.7
    tools: List[str] = []

class AgentOut(AgentCreate):
    id: str
