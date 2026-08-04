# CareerAIsle - Implementation Plan

## Overview

CareerAIsle is an AI-powered career guidance section inside LanTURN.

Its purpose is to provide every student with a personalized career roadmap instead of a static list of courses.

The roadmap must adapt to:
- User's career goal
- Current skill level
- Resume
- Existing skills
- Education
- Projects
- Experience
- Time commitment
- Preferred technologies

CareerAIsle should feel like a premium learning platform rather than another checklist website.

---

# Objectives

CareerAIsle should help users answer:
- What career should I pursue?
- What skills am I missing?
- What should I learn next?
- Which projects should I build?
- Which certifications should I earn?
- Am I industry ready?
- How far have I progressed?

---

# Design Philosophy

- Do NOT use hardcoded roadmaps.
- Generate every roadmap dynamically using AI.
- Roadmaps should adapt to the user's resume, goals, and experience.
- Persist all progress in the database.
- Build a polished, animated, responsive experience inspired by modern products such as Roadmap.sh, Linear, Notion, and Duolingo.

---

# AI Flow

User Profile + Resume + Career Goal + Current Skills
→ Gemini Analysis
→ Determine career path, skill level, missing skills, learning order
→ Generate structured roadmap
→ Save roadmap
→ Render interactive timeline
→ Track and persist progress

---

# Supported Career Domains

Support (extensible):
- Frontend
- Backend
- Full Stack
- Android
- iOS
- AI / ML
- Data Science
- Cyber Security
- Cloud
- DevOps
- UI/UX
- Product Management
- Business Analyst
- Digital Marketing
- Blockchain
- Game Development
- QA
- Embedded Systems
- Data Engineering
- System Administration

---

# Roadmap Structure

Each AI-generated stage should include:
- Stage Number
- Title
- Description
- Estimated Duration
- Difficulty
- Learning Objectives
- Topics
- Mini Projects
- Capstone Project
- Best Learning Resources
- Completion Status
- Badge
- Notes

---

# Progress Tracking

Track:
- Topic completion
- Stage completion
- Overall roadmap %
- Career readiness %
- Badges
- Milestones

Persist in database:
- career_roadmaps
- roadmap_progress
- completed_topics
- milestones
- user_badges

---

# UI / UX

Build an interactive vertical timeline inspired by the provided reference image.

Requirements:
- Smooth Framer Motion animations
- Expandable stage cards
- Animated progress bars
- Responsive design
- Dark mode
- Keyboard accessible
- Touch friendly

Each stage card contains:
- Topics checklist
- Resources
- Projects
- Estimated time
- Difficulty
- Progress
- Next stage preview

---

# Learning Resources

Prioritize:
1. Official Documentation
2. University Material
3. Industry Documentation
4. High-quality Open Source Guides

Preferred:
- MDN
- React Docs
- Node.js Docs
- Microsoft Learn
- Google Developers
- AWS Docs
- Docker Docs
- Kubernetes Docs
- OWASP
- TensorFlow
- PyTorch
- Cisco Networking Academy
- CS50
- MIT OpenCourseWare
- FreeCodeCamp
- Roadmap.sh
- The Odin Project

---

# AI Personalization

Gemini should personalize:
- Stages
- Topics
- Learning order
- Difficulty
- Projects
- Resources
- Timeline

Based on:
- Resume
- Experience
- Skills
- Career goal
- GitHub
- Portfolio
- Available study time

---

# Career DNA Integration

CareerAIsle should integrate with the Career DNA feature.

Completing roadmap stages should improve Career Readiness and update the user's radar chart.

---

# Future Features

- Daily challenges
- Weekly goals
- AI mentor
- Mock interviews
- XP system
- Leaderboards
- Skill heatmaps
- Learning calendar
- Calendar sync

---

# Deliverables

- AI-generated personalized roadmaps
- Interactive animated timeline
- Persistent progress tracking
- Premium responsive UI
- Dynamic resources
- Mini & capstone projects
- Achievement system
- Career DNA integration

---

# Success Criteria

CareerAIsle should motivate students to continuously improve while giving recruiters visibility into each student's learning journey and career readiness.
