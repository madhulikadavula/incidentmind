import os
import requests

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from groq import Groq


# Load root .env
load_dotenv("../.env")


# ---------------------------------------------------------
# Configuration
# ---------------------------------------------------------

HINDSIGHT_API_KEY = os.getenv("HINDSIGHT_API_KEY")

HINDSIGHT_BASE_URL = os.getenv(
    "HINDSIGHT_BASE_URL",
    "https://api.hindsight.vectorize.io"
)

HINDSIGHT_BANK_ID = os.getenv(
    "HINDSIGHT_BANK_ID",
    "incidentmind"
)

GROQ_API_KEY = os.getenv("GROQ_API_KEY")

# Frontend URL for CORS
FRONTEND_URL = os.getenv(
    "FRONTEND_URL",
    "http://localhost:5173"
)

groq_client = (
    Groq(api_key=GROQ_API_KEY)
    if GROQ_API_KEY
    else None
)


# ---------------------------------------------------------
# App
# ---------------------------------------------------------

app = FastAPI(
    title="IncidentMind API",
    description="AI Incident Response Agent with Hindsight Memory",
    version="1.0.0"
)


# ---------------------------------------------------------
# CORS
# ---------------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://incidentmind-theta.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------
# Models
# ---------------------------------------------------------

class IncidentRequest(BaseModel):
    incident: str


# ---------------------------------------------------------
# Hindsight helpers
# ---------------------------------------------------------

def hindsight_headers():
    return {
        "Authorization": f"Bearer {HINDSIGHT_API_KEY}",
        "Content-Type": "application/json",
    }


def hindsight_url(path: str):
    return (
        f"{HINDSIGHT_BASE_URL}"
        f"/v1/default/banks/{HINDSIGHT_BANK_ID}"
        f"{path}"
    )


def check_hindsight():
    if not HINDSIGHT_API_KEY:
        raise HTTPException(
            status_code=500,
            detail="HINDSIGHT_API_KEY is not configured."
        )


# ---------------------------------------------------------
# Health
# ---------------------------------------------------------

@app.get("/api/health")
def health():
    return {
        "status": "ok",
        "hindsight_configured": bool(HINDSIGHT_API_KEY),
        "groq_configured": bool(GROQ_API_KEY),
        "memory_bank": HINDSIGHT_BANK_ID,
    }


# ---------------------------------------------------------
# RECALL
# ---------------------------------------------------------

@app.post("/api/incidents/recall")
def recall_incident(request: IncidentRequest):

    check_hindsight()

    incident = request.incident.strip()

    if not incident:
        raise HTTPException(
            status_code=400,
            detail="Incident description cannot be empty."
        )

    try:
        response = requests.post(
            hindsight_url("/memories/recall"),
            headers=hindsight_headers(),
            json={
                "query": incident,
                "types": [
                    "world",
                    "experience",
                    "observation"
                ]
            },
            timeout=60,
        )

        if not response.ok:
            raise HTTPException(
                status_code=response.status_code,
                detail=response.text
            )

        return response.json()

    except requests.RequestException as error:
        raise HTTPException(
            status_code=502,
            detail=f"Hindsight recall failed: {error}"
        )


# ---------------------------------------------------------
# REFLECT
# ---------------------------------------------------------

@app.post("/api/incidents/reflect")
def reflect_incident(request: IncidentRequest):

    check_hindsight()

    incident = request.incident.strip()

    if not incident:
        raise HTTPException(
            status_code=400,
            detail="Incident description cannot be empty."
        )

    query = f"""
We are investigating this production incident:

{incident}

Reflect over the incident-response memories in the IncidentMind memory bank.

Identify:
1. Similar incidents that happened before.
2. Recurring root causes or patterns.
3. Previous resolutions that worked.
4. What an incident responder should verify now.
5. Any lessons that should be remembered for future incidents.

Ground the response in the memories you retrieve.
Do not invent previous incidents or resolutions.
"""

    try:
        response = requests.post(
            hindsight_url("/reflect"),
            headers=hindsight_headers(),
            json={
                "query": query,
                "budget": "mid",
                "include": {
                    "facts": {}
                }
            },
            timeout=120,
        )

        if not response.ok:
            raise HTTPException(
                status_code=response.status_code,
                detail=response.text
            )

        return response.json()

    except requests.RequestException as error:
        raise HTTPException(
            status_code=502,
            detail=f"Hindsight reflect failed: {error}"
        )


# ---------------------------------------------------------
# INVESTIGATE
# ---------------------------------------------------------

@app.post("/api/incidents/investigate")
def investigate_incident(request: IncidentRequest):

    check_hindsight()

    if not GROQ_API_KEY or not groq_client:
        raise HTTPException(
            status_code=500,
            detail="GROQ_API_KEY is not configured."
        )

    incident = request.incident.strip()

    if not incident:
        raise HTTPException(
            status_code=400,
            detail="Incident description cannot be empty."
        )

    # -----------------------------------------------------
    # 1. Recall
    # -----------------------------------------------------

    try:
        recall_response = requests.post(
            hindsight_url("/memories/recall"),
            headers=hindsight_headers(),
            json={
                "query": incident,
                "types": [
                    "world",
                    "experience",
                    "observation"
                ]
            },
            timeout=60,
        )

        if not recall_response.ok:
            raise HTTPException(
                status_code=recall_response.status_code,
                detail=recall_response.text
            )

        memories = recall_response.json()

    except requests.RequestException as error:
        raise HTTPException(
            status_code=502,
            detail=f"Hindsight recall failed: {error}"
        )

    # -----------------------------------------------------
    # 2. Reflect
    # -----------------------------------------------------

    reflect_query = f"""
Production incident:

{incident}

Analyze this incident using the incident-response experience
stored in the IncidentMind memory bank.

Determine:
- similar historical incidents
- recurring root causes
- previously successful resolutions
- important verification steps
- lessons for future incidents

Only make claims supported by retrieved memory.
"""

    try:
        reflect_response = requests.post(
            hindsight_url("/reflect"),
            headers=hindsight_headers(),
            json={
                "query": reflect_query,
                "budget": "mid",
                "include": {
                    "facts": {}
                }
            },
            timeout=120,
        )

        if not reflect_response.ok:
            raise HTTPException(
                status_code=reflect_response.status_code,
                detail=reflect_response.text
            )

        reflection = reflect_response.json()

    except requests.RequestException as error:
        raise HTTPException(
            status_code=502,
            detail=f"Hindsight reflect failed: {error}"
        )

    # -----------------------------------------------------
    # 3. Prepare memory context
    # -----------------------------------------------------

    recalled_results = memories.get("results", [])

    memory_text = "\n\n".join(
        [
            (
                f"Memory {index + 1}: "
                f"{memory.get('text') or memory.get('content') or ''}"
            )
            for index, memory in enumerate(recalled_results[:5])
        ]
    )

    reflection_text = reflection.get("text", "")

    if not memory_text:
        memory_text = "No directly recalled memories were found."

    if not reflection_text:
        reflection_text = "No Hindsight reflection was returned."

    # -----------------------------------------------------
    # 4. Groq investigation
    # -----------------------------------------------------

    prompt = f"""
You are IncidentMind, an AI incident-response assistant.

Current incident:
{incident}

Relevant memories recalled from Hindsight:
{memory_text}

Hindsight reflection:
{reflection_text}

Analyze the current incident.

Your response must contain:

1. Likely cause
2. Recommended actions
3. Evidence from previous incidents
4. What should be verified before applying the previous resolution
5. Lesson for future incidents

Important:
- Use the recalled memories and Hindsight reflection as evidence.
- Clearly distinguish historical evidence from assumptions.
- Do not invent historical incidents.
- Give practical incident-response steps.
"""

    try:
        ai_response = groq_client.chat.completions.create(
            model="openai/gpt-oss-120b",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are a careful production incident-response "
                        "assistant. Ground recommendations in evidence."
                    ),
                },
                {
                    "role": "user",
                    "content": prompt,
                },
            ],
            temperature=0.2,
        )

        analysis = (
            ai_response.choices[0].message.content
            or "No AI analysis was returned."
        )

    except Exception as error:
        raise HTTPException(
            status_code=502,
            detail=f"Groq investigation failed: {error}"
        )

    # -----------------------------------------------------
    # 5. Return complete agent result
    # -----------------------------------------------------

    return {
        "success": True,
        "incident": incident,
        "memory_bank": HINDSIGHT_BANK_ID,
        "memories": memories,
        "reflection": reflection,
        "analysis": analysis,
        "agent_pipeline": [
            "recall",
            "reflect",
            "groq_analysis"
        ]
    }


# ---------------------------------------------------------
# RETAIN
# ---------------------------------------------------------

@app.post("/api/incidents/resolve")
def resolve_incident(request: IncidentRequest):

    check_hindsight()

    incident = request.incident.strip()

    if not incident:
        raise HTTPException(
            status_code=400,
            detail="Resolution cannot be empty."
        )

    try:
        response = requests.post(
            hindsight_url("/memories"),
            headers=hindsight_headers(),
            json={
                "items": [
                    {
                        "content": incident,
                        "context": "incident_resolution"
                    }
                ]
            },
            timeout=60,
        )

        if not response.ok:
            raise HTTPException(
                status_code=response.status_code,
                detail=response.text
            )

        result = response.json()

        return {
            "success": True,
            "message": "Resolution retained in Hindsight.",
            "memory_bank": HINDSIGHT_BANK_ID,
            "hindsight": result,
        }

    except requests.RequestException as error:
        raise HTTPException(
            status_code=502,
            detail=f"Hindsight retain failed: {error}"
        )


# ---------------------------------------------------------
# MEMORY TIMELINE
# ---------------------------------------------------------

@app.get("/api/memory")
def get_memory():

    check_hindsight()

    try:
        response = requests.get(
            hindsight_url("/memories/list"),
            headers=hindsight_headers(),
            params={
                "limit": 30,
                "offset": 0,
            },
            timeout=60,
        )

        if not response.ok:
            raise HTTPException(
                status_code=response.status_code,
                detail=response.text
            )

        data = response.json()

        return {
            "success": True,
            "memory_bank": HINDSIGHT_BANK_ID,
            "items": data.get("items", []),
            "total": data.get(
                "total",
                len(data.get("items", []))
            ),
        }

    except requests.RequestException as error:
        raise HTTPException(
            status_code=502,
            detail=f"Hindsight memory listing failed: {error}"
        )