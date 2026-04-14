# TeamGoals Product Requirements Document

## Project Overview
TeamGoals is a SaaS platform for real estate teams to track and visualize their performance goals.

## Core Features

### 1. Multi-Tenant Onboarding
- Users can create a new team dashboard.
- Configures company name, theme, and branding.
- Setup admin credentials.

### 2. Admin Management Console
- Roster management (agents, goals, production).
- Sub-team / Division grouping.
- Transaction tracking (Closed, Pending, Active).

### 3. Agent Performance Profiles
- Individual agent metrics.
- Production trend visualization.
- Transaction history.

### 4. Public Team Dashboard
- High-level overview of team progress.
- TV-optimized mode for office displays.

### 5. Billing & Subscriptions
- Integration with Stripe for paid plans.
- Trial period management.

### 6. Authentication & Security
- NextAuth integration with Credentials and Google.
- HMAC-based password reset via email.
- Viewer password for private dashboards.

## Technical Requirements
- Edge-compatible runtime (Next.js 15).
- Cloudflare D1 for data persistence.
- SMTP2GO for transactional emails.
- Stripe for payments.
