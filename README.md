# IncidentMind

### AI-Powered Incident Response with Persistent Memory

Built for **HackwithHyderabad 3.0** under the theme **“AI Agents That Learn Using Hindsight.”**

## Overview

**IncidentMind** is an AI-powered incident-response agent that helps engineers investigate recurring production incidents using persistent memory.

It uses **Hindsight** to remember previous incidents, resolutions, recurring patterns, and lessons, allowing the agent to use past experience when investigating future incidents.

**Core Loop:** Recall → Reason → Resolve → Retain → Reflect → Learn

## Problem

Production incidents often repeat, such as API latency, database connection issues, and recurring infrastructure failures. Engineers shouldn't have to start from zero every time.

## Solution

IncidentMind combines:

* **Hindsight** for persistent incident memory
* **Groq** for AI-powered reasoning
* **React + Vite** for the user interface
* **FastAPI** for the backend

When an incident is reported, IncidentMind recalls relevant historical incidents from Hindsight and provides an AI-assisted investigation. After the incident is resolved, the resolution is stored back in Hindsight so it can be used in future investigations.

## How Hindsight Is Used

**Recall** — Retrieves relevant historical incidents and resolutions.

**Reason** — Groq uses the current incident together with recalled history to generate an investigation.

**Retain** — The incident and successful resolution are stored in Hindsight.

**Reflect** — Hindsight identifies recurring root causes, successful resolutions, and lessons from accumulated memories.

## Example

**Incident:**
Payment API latency increased to 4.8 seconds with database connection timeouts.

**Investigation:**
IncidentMind recalls previous database connection issues and identifies connection-pool exhaustion as a likely cause.

**Resolution:**
The database connection pool was increased from 20 to 50 connections and the idle timeout was adjusted.

**Future Learning:**
The resolution is retained in Hindsight and can be recalled when a similar incident occurs again.

## Tech Stack

**Frontend:** React, Vite, JavaScript, CSS

**Backend:** Python, FastAPI, Uvicorn, REST APIs

**AI & Memory:** Hindsight Cloud, Groq, `openai/gpt-oss-120b`

**Deployment:** Vercel, Render, GitHub

## Backend API

| Endpoint                          | Purpose                        |
| --------------------------------- | ------------------------------ |
| `GET /api/health`                 | Health and configuration check |
| `POST /api/incidents/recall`      | Retrieve relevant memories     |
| `POST /api/incidents/investigate` | Investigate an incident        |
| `POST /api/incidents/resolve`     | Store an incident resolution   |
| `POST /api/incidents/reflect`     | Identify patterns and lessons  |
| `GET /api/memory`                 | View stored memories           |

## Demo

The demonstration shows the complete learning cycle:

**Report Incident → Recall History → AI Investigation → Resolve → Retain → Reflect**

The Payment API scenario demonstrates how a previous resolution can become useful knowledge for a future incident.

## Key Features

* Persistent incident memory
* Historical incident recall
* AI-assisted investigation
* Evidence from previous incidents
* Resolution retention
* Recurring root-cause identification
* Memory reflection
* Hindsight memory dashboard
* Production deployment

## Why Hindsight?

Hindsight is not simply a database for IncidentMind. It gives the agent persistent experience that can be recalled and reused during future investigations.

This allows IncidentMind to move from a **stateless AI assistant** toward an agent that can learn from previous incident experiences.

**IncidentMind**

Built for **HackwithHyderabad 3.0**.

## License

This project was created as a hackathon project.
