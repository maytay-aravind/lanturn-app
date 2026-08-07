# Employer / Company Module - Implementation Plan

## Overview

This document defines the implementation plan for the Employer side of
LanTURN.

The Employer module allows companies to create organization profiles,
post jobs and internships, manage applicants, track recruitment
analytics, and communicate hiring decisions.

------------------------------------------------------------------------

# Phase 1: Fix Employer Login Internal Server Error

## Current Issue

When selecting Employer login, the application throws an Internal Server
Error.

## Investigation

Audit:

-   Firebase authentication flow
-   Employer role detection
-   Backend authorization middleware
-   Supabase user/company queries
-   Employer profile creation logic
-   Frontend routing

Expected flow:

Google Login → Firebase Authentication → Backend token verification →
Check user role → Create/fetch employer profile → Redirect to Company
Dashboard

Valid employer accounts must never receive server errors.

------------------------------------------------------------------------

# Phase 2: Company Dashboard

Create a professional employer dashboard with:

-   Active vacancies
-   Total jobs posted
-   Total applicants
-   Rejected applicants
-   Shortlisted applicants
-   Hired applicants
-   Employee count

## Visual Analytics

Use:

-   Bar charts
-   Line graphs
-   Pie charts
-   Progress cards

Display:

-   Applications over time
-   Hiring conversion rate
-   Recruitment pipeline
-   Job performance

------------------------------------------------------------------------

# Phase 3: Company Profile

Create a complete company profile system.

## Company Details

Include:

-   Company name
-   Logo
-   Description
-   Website
-   Industry
-   Email
-   Contact information
-   Address
-   Headquarters
-   Branches
-   CEO / Founder
-   Founded year
-   Employee count
-   Company size
-   Company culture
-   Benefits
-   Technologies used
-   Office images

Students should be able to view company profiles.

------------------------------------------------------------------------

# Phase 4: Post Jobs / Internships

Employers should be able to create opportunities.

## Job Information

Fields:

-   Job title
-   Role
-   Department
-   Description
-   Responsibilities
-   Requirements
-   Skills required

## Employment Type

Options:

-   Full-time
-   Part-time
-   Internship
-   Contract

## Work Mode

Options:

-   Onsite
-   Remote
-   Hybrid

## Compensation

Fields:

-   Stipend
-   Salary package
-   Salary range
-   Negotiable option

## Additional Details

-   Location
-   Experience required
-   Education requirement
-   Number of openings
-   Application deadline
-   Benefits

Employer actions:

-   Create
-   Edit
-   Delete
-   Pause
-   Reopen jobs

------------------------------------------------------------------------

# Phase 5: Applicant Responses

Create an applicant management system.

Display:

-   Applicant name
-   Profile picture
-   Applied role
-   Date applied
-   Skills
-   Resume
-   Application status

Statuses:

-   Applied
-   Reviewing
-   Shortlisted
-   Rejected
-   Hired

------------------------------------------------------------------------

# Applicant Profile View

Employer can view:

-   Student profile
-   Education
-   Skills
-   Projects
-   Experience
-   Certifications
-   GitHub
-   LinkedIn
-   Portfolio
-   Resume

Actions:

-   View resume
-   Download resume
-   Shortlist
-   Reject
-   Hire

------------------------------------------------------------------------

# Notification System

Both parties must receive updates.

## Employer receives:

-   New applications
-   Student activity
-   Application updates

## Student receives:

-   Application confirmation
-   Shortlist notification
-   Rejection notification
-   Hiring notification

Channels:

-   In-app notifications
-   Email notifications

------------------------------------------------------------------------

# Database Requirements

## companies

Stores company information:

-   id
-   user_id
-   company_name
-   logo_url
-   description
-   website
-   CEO
-   branches
-   employee_count

## jobs

Stores openings:

-   id
-   company_id
-   title
-   role
-   employment_type
-   work_mode
-   location
-   stipend
-   package
-   requirements
-   status

## applications

Stores applications:

-   id
-   job_id
-   student_id
-   status
-   applied_at

## notifications

Stores user notifications.

------------------------------------------------------------------------

# Security

Implement:

-   Firebase token verification
-   Role based authorization
-   Employer ownership checks

An employer must only manage their own company and jobs.

------------------------------------------------------------------------

# UI Requirements

The employer portal should feel like a professional SaaS dashboard.

Requirements:

-   Responsive design
-   Smooth animations
-   Interactive charts
-   Modern cards
-   Mobile support
-   Dark mode support

------------------------------------------------------------------------

# Development Order

1.  Fix employer authentication.
2.  Implement company profile.
3.  Implement job posting.
4.  Implement applicant management.
5.  Implement notifications.
6.  Implement analytics dashboard.

------------------------------------------------------------------------

# Final Goal

The employer side of LanTURN should provide a complete recruitment
platform where companies can create profiles, post opportunities,
discover students, manage applications, and track hiring performance.
