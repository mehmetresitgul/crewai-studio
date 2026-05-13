import asyncio
import json
import io
import pdfplumber
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from crewai import LLM, Agent, Task, Crew
import threading
import queue

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

DEFAULT_LLM = {
    "model": "openai/claude-sonnet-4-6",
    "base_url": "https://app.claude.gg/",
    "api_key": "sk-e3455b976eca4f05a0c6d9c3045cc9bb",
}


class AgentConfig(BaseModel):
    role: str
    goal: str
    backstory: str


class TaskConfig(BaseModel):
    description: str
    expected_output: str
    agent_index: int = 0


class RunRequest(BaseModel):
    agents: list[AgentConfig]
    tasks: list[TaskConfig]
    llm: dict = None


def run_crew_sync(agents_cfg, tasks_cfg, llm_cfg, result_queue):
    try:
        llm = LLM(
            model=llm_cfg["model"],
            base_url=llm_cfg["base_url"],
            api_key=llm_cfg["api_key"],
        )

        agents = [
            Agent(
                role=a.role,
                goal=a.goal,
                backstory=a.backstory or "You are a helpful assistant.",
                llm=llm,
                verbose=False,
            )
            for a in agents_cfg
        ]

        tasks = [
            Task(
                description=t.description,
                expected_output=t.expected_output,
                agent=agents[t.agent_index % len(agents)],
            )
            for t in tasks_cfg
        ]

        crew = Crew(agents=agents, tasks=tasks, verbose=False)
        output = crew.kickoff()
        result_queue.put({"type": "result", "content": str(output)})
    except Exception as e:
        result_queue.put({"type": "error", "content": str(e)})


@app.post("/api/extract-pdf")
async def extract_pdf(file: UploadFile = File(...)):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Sadece PDF dosyası yüklenebilir.")

    contents = await file.read()
    if len(contents) > 20 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="PDF 20 MB'dan küçük olmalı.")

    try:
        with pdfplumber.open(io.BytesIO(contents)) as pdf:
            pages = []
            for i, page in enumerate(pdf.pages):
                text = page.extract_text() or ""
                if text.strip():
                    pages.append(text)

        if not pages:
            raise HTTPException(status_code=422, detail="PDF'ten metin çıkarılamadı. Taramalı (görüntü) PDF olabilir.")

        full_text = "\n\n".join(pages)
        return {
            "text": full_text,
            "page_count": len(pdf.pages) if False else len(pages),
            "char_count": len(full_text),
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF okuma hatası: {str(e)}")


@app.post("/api/run")
async def run_crew(req: RunRequest):
    llm_cfg = req.llm or DEFAULT_LLM

    async def event_stream():
        yield f"data: {json.dumps({'type': 'start', 'content': 'Crew başlatıldı...'})}\n\n"

        result_queue = queue.Queue()
        thread = threading.Thread(
            target=run_crew_sync,
            args=(req.agents, req.tasks, llm_cfg, result_queue),
            daemon=True,
        )
        thread.start()

        dots = 0
        while thread.is_alive():
            await asyncio.sleep(1)
            dots = (dots % 3) + 1
            yield f"data: {json.dumps({'type': 'progress', 'content': 'Çalışıyor' + '.' * dots})}\n\n"

        result = result_queue.get()
        yield f"data: {json.dumps(result)}\n\n"
        yield "data: [DONE]\n\n"

    return StreamingResponse(event_stream(), media_type="text/event-stream")


@app.get("/api/health")
async def health():
    return {"status": "ok"}
