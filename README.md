IncidentMind

AI-powered incident-response agent with persistent memory using
Hindsight

Built for HackwithHyderabad 3.0 under the theme "AI Agents That
Learn Using Hindsight."

Overview

IncidentMind is an AI-powered incident-response assistant designed to
help engineers investigate recurring production incidents using
persistent organizational memory.

Traditional AI assistants can analyze an incident, but they may not
remember what happened during previous incidents or which resolution
worked. IncidentMind uses Hindsight as a persistent memory layer so
that previous incidents, resolutions, patterns, and lessons can be
recalled during future investigations.

Core Learning Loop

Recall → Reason → Resolve → Retain → Reflect → Learn

Problem

Production incidents often repeat:

API latency and timeout issues

Database connection problems

Recurring infrastructure failures

Similar root causes across different incidents

An engineer should not have to start from zero every time.

Solution

IncidentMind:

Receives a new incident from an engineer.

Recalls relevant historical memories from Hindsight.

Combines the current incident with historical context.

Uses Groq-powered AI reasoning to investigate the incident.

Provides likely causes, evidence, diagnostics, and recommended
actions.

Allows the engineer to submit the successful resolution.

Stores the incident and resolution back in Hindsight.

Reflects over accumulated memories to identify recurring patterns
and lessons.

Uses those memories during future investigations.

Architecture

┌──────────────────────────┐
│      React Frontend      │
│        Vite UI           │
└────────────┬─────────────┘
             │ REST API
             ▼
┌──────────────────────────┐
│     FastAPI Backend      │
│      Python / Uvicorn    │
└────────────┬─────────────┘
             │
      ┌──────┴───────┐
      │              │
      ▼              ▼
┌─────────────┐  ┌────────────────┐
│  Hindsight  │  │      Groq      │
│ Persistent  │  │  AI Reasoning  │
│   Memory    │  │ GPT-OSS-120B   │
└──────┬──────┘  └───────┬────────┘
       │                  │
       └────────┬─────────┘
                ▼
       Investigation Result
                │
                ▼
        Engineer Resolution
                │
                ▼
       Hindsight Retain
                │
                ▼
        Hindsight Reflect

How Hindsight Is Used

Hindsight is the central memory layer of IncidentMind.

1. Recall

When an incident is reported, IncidentMind searches the Hindsight memory
bank for relevant previous incidents and resolutions.

Example:

Current incident:
Payment API latency increased to 4.8 seconds.

Historical memories:
- Payment API latency of 4.8–5 seconds
- Database connection exhaustion
- Previous successful pool-size increase

2. Reason

The recalled memories are combined with the current incident and passed
to the Groq-powered reasoning layer.

3. Retain

After the engineer resolves the incident, the incident and successful
resolution are stored in Hindsight.

Example:

Increased database connection pool from 20 to 50
connections and adjusted the idle timeout.

4. Reflect

Hindsight reflects over accumulated memories to identify:

Similar incidents

Recurring root causes

Previous successful resolutions

What responders should verify

Lessons for future incidents

This makes persistent memory visible and useful rather than simply
storing data.

Example Incident

Incident

Payment API latency increased to 4.8 seconds
and database connection timeouts are appearing
in the logs.

Recalled History

IncidentMind recalls previous Payment API incidents involving database
connection delays and pool exhaustion.

AI Investigation

The AI identifies database connection pool exhaustion as a likely cause
and recommends checking:

Current connection pool usage

Database connection count

Traffic volume

Connection leaks

Query performance

Recent deployments

Resolution

Increased the database connection pool from 20 to
50 connections and adjusted the idle timeout.

Future Learning

The resolution is retained in Hindsight. During a future similar
incident, IncidentMind can recall this previous experience and use it as
supporting evidence.

Tech Stack

Frontend

React

Vite

JavaScript

CSS

Backend

Python

FastAPI

Uvicorn

REST APIs

AI and Memory

Hindsight Cloud --- persistent memory

Groq --- AI reasoning

openai/gpt-oss-120b

Deployment

Vercel --- frontend

Render --- backend

GitHub --- source control

Project Structure

IncidentMind/
├── backend/
│   ├── main.py
│   ├── requirements.txt
│   └── venv/
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── ...
│
├── .env
├── .gitignore
└── README.md

main is the Git branch. backend/ and frontend/ are folders
inside that branch.

Backend API

Health

GET /api/health

Checks backend and configuration status.

Recall

POST /api/incidents/recall

Retrieves relevant memories for an incident.

Investigate

POST /api/incidents/investigate

Runs the incident investigation using Hindsight memories and AI
reasoning.

Resolve

POST /api/incidents/resolve

Stores the incident resolution in Hindsight.

Reflect

POST /api/incidents/reflect

Analyzes accumulated incident memories and identifies patterns and
lessons.

Memory

GET /api/memory

Retrieves stored memories for the Hindsight Memory dashboard.

Local Setup

1. Clone the repository

git clone https://github.com/madhulikadavula/incidentmind.git
cd incidentmind

2. Backend setup

cd backend
python -m venv venv
source venv/Scripts/activate
pip install -r requirements.txt

For Windows PowerShell:

.\venv\Scripts\Activate.ps1

3. Environment variables

Create a .env file in the project root:

HINDSIGHT_API_KEY=your_hindsight_api_key
HINDSIGHT_BASE_URL=https://api.hindsight.vectorize.io
HINDSIGHT_BANK_ID=incidentmind
GROQ_API_KEY=your_groq_api_key
FRONTEND_URL=http://localhost:5173

Never commit API keys or other secrets.

4. Start the backend

From the project root:

uvicorn backend.main:app --reload

Backend:

http://127.0.0.1:8000

API documentation:

http://127.0.0.1:8000/docs

5. Frontend setup

Open another terminal:

cd frontend
npm install

Create frontend/.env:

VITE_API_BASE_URL=http://127.0.0.1:8000

Start the frontend:

npm run dev

Frontend:

http://localhost:5173

Production Deployment

Frontend --- Vercel

The frontend is deployed from:

main branch
└── frontend/

Environment variable:

VITE_API_BASE_URL=https://incidentmind-backend.onrender.com

Backend --- Render

The backend is deployed from:

main branch
└── backend/

Build command:

pip install -r backend/requirements.txt

Start command:

uvicorn backend.main:app --host 0.0.0.0 --port $PORT

Required backend environment variables:

HINDSIGHT_API_KEY
HINDSIGHT_BASE_URL
HINDSIGHT_BANK_ID
GROQ_API_KEY
FRONTEND_URL

Demo Flow

The recommended live demonstration is:

1. Report Incident
        ↓
2. Hindsight Recall
        ↓
3. Groq AI Investigation
        ↓
4. Resolve Incident
        ↓
5. Retain Resolution in Hindsight
        ↓
6. Hindsight Memory Dashboard
        ↓
7. Memory Reflection
        ↓
8. Show Recurring Patterns and Lessons

Demo Scenario

Use the Payment API incident:

Payment API latency increased to 4.8 seconds
and database connection timeouts are appearing in the logs.

Then show that Hindsight recalls previous related incidents and the
successful database connection-pool resolution.

Key Features

Persistent incident memory

Historical incident recall

AI-assisted investigation

Evidence from previous incidents

Resolution retention

Memory reflection

Recurring root-cause identification

Proven-resolution tracking

Live incident history

Hindsight memory dashboard

Production deployment

Why Hindsight Matters

Hindsight is not simply used as a database for IncidentMind.

It enables the agent to maintain a persistent history of incident
experiences and use that history when investigating future incidents.

The important distinction is:

Stateless AI
Current Incident → Answer

IncidentMind
Current Incident
      +
Historical Memory
      ↓
Context-Aware Investigation
      ↓
Resolution
      ↓
Persistent Memory
      ↓
Better Future Investigations

Project Outcome

During testing, IncidentMind successfully demonstrated a complete memory
loop:

A Payment API incident was investigated.

Relevant previous incidents were recalled.

A previous successful resolution was surfaced.

The new resolution was retained.

The Hindsight Memory dashboard displayed the accumulated memories.

Reflection identified database connection-pool exhaustion as a
recurring pattern and surfaced the previous resolution.

Future Improvements

Possible future enhancements include:

Integration with real monitoring and observability platforms

Automatic incident ingestion from alerts

Slack/Teams incident notifications

More structured incident timelines

Automatic severity classification

Service dependency analysis

Automated post-incident reports

More advanced incident correlation

Team-level memory and access controls

Team

IncidentMind

Built for HackwithHyderabad 3.0.

License

This project was created as a hackathon project.