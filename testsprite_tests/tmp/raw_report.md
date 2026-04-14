
# TestSprite AI Testing Report(MCP)

---

## 1️⃣ Document Metadata
- **Project Name:** nspg-dashboard
- **Date:** 2026-04-14
- **Prepared by:** TestSprite AI Team

---

## 2️⃣ Requirement Validation Summary

#### Test TC001 View team metrics and use TV-optimized mode
- **Test Code:** [TC001_View_team_metrics_and_use_TV_optimized_mode.py](./TC001_View_team_metrics_and_use_TV_optimized_mode.py)
- **Test Error:** TEST FAILURE

A TV-optimized view control (toggle/button) could not be found on the public demo/dashboard page, so the TV view cannot be tested.

Observations:
- The public demo dashboard displays high-level metrics (Production total: $22,450,000; Production progress: 45%; Goal: $50,000,000; Avg Deal Size: $850k).
- No TV-optimized mode toggle or button is visible in the page's interactive elements or UI.
- Demo entry point was clickable and dashboard content is present, but the TV view feature appears to be missing.

- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/d8dd49e7-39d1-4adf-a2b5-2b62e9a7a898/0a739cf9-ca8a-451f-b406-7468895a98da
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC002 Public team dashboard displays core team metrics and goal completion
- **Test Code:** [TC002_Public_team_dashboard_displays_core_team_metrics_and_goal_completion.py](./TC002_Public_team_dashboard_displays_core_team_metrics_and_goal_completion.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/d8dd49e7-39d1-4adf-a2b5-2b62e9a7a898/04c03b3f-5196-48a1-ae01-77c8a33db87a
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC003 Access control redirects unauthenticated users away from admin console
- **Test Code:** [TC003_Access_control_redirects_unauthenticated_users_away_from_admin_console.py](./TC003_Access_control_redirects_unauthenticated_users_away_from_admin_console.py)
- **Test Error:** TEST BLOCKED

The feature could not be reached — the admin console page did not respond, so the redirect could not be verified.

Observations:
- The browser shows "This page isn't working" and "ERR_EMPTY_RESPONSE" for http://localhost:3000/admin/login
- The page only displays a single "Reload" button; no admin login UI or redirect content is visible
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/d8dd49e7-39d1-4adf-a2b5-2b62e9a7a898/bb460d4c-6ea7-45bb-97e6-0ddbd0009499
- **Status:** BLOCKED
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC004 Public viewer can switch to TV-optimized mode
- **Test Code:** [TC004_Public_viewer_can_switch_to_TV_optimized_mode.py](./TC004_Public_viewer_can_switch_to_TV_optimized_mode.py)
- **Test Error:** TEST FAILURE

A TV-optimized mode control is not available on the public demo dashboard so a public viewer cannot switch to TV mode.

Observations:
- No 'TV Mode' or 'TV' toggle/link found on the /demo page after searching and inspecting interactive elements.
- The page shows a demo banner and dashboard content (production tracker, roster) but only includes a year selector and an 'Admin Console (Locked)' button as visible interactive controls.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/d8dd49e7-39d1-4adf-a2b5-2b62e9a7a898/d1ff7735-ae77-4f30-9104-edd4c3fecfa7
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC005 Create a new tenant dashboard via onboarding
- **Test Code:** [TC005_Create_a_new_tenant_dashboard_via_onboarding.py](./TC005_Create_a_new_tenant_dashboard_via_onboarding.py)
- **Test Error:** TEST BLOCKED

The feature could not be reached — the onboarding flow cannot be completed because the team subdomain is unreachable in this environment.

Observations:
- Submitting the team subdomain on the landing page (clicking GO / pressing Enter) did not open the onboarding form; the landing page remained showing the subdomain input.
- Direct navigation to http://teamgoals-qa-team.localhost:3000/ returned an ERR_EMPTY_RESPONSE (empty response), preventing access to the onboarding flow or the new team's public dashboard.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/d8dd49e7-39d1-4adf-a2b5-2b62e9a7a898/d8c8b95f-05f8-4bc8-9f77-d69ed11c0790
- **Status:** BLOCKED
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC006 Admin adds an agent, saves, publishes, and sees agent on public dashboard
- **Test Code:** [TC006_Admin_adds_an_agent_saves_publishes_and_sees_agent_on_public_dashboard.py](./TC006_Admin_adds_an_agent_saves_publishes_and_sees_agent_on_public_dashboard.py)
- **Test Error:** TEST BLOCKED

I could not reach the onboarding or admin flows needed to add an agent, so the test cannot proceed.

Observations:
- The landing page still shows the team subdomain input and GO button after multiple attempts to start onboarding.
- Navigating to /demo displayed 'Initializing Demo...' and there were 0 interactive elements, so the demo/admin UI did not initialize.
- The Features page is accessible but does not expose any admin/roster controls that would allow continuing the test.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/d8dd49e7-39d1-4adf-a2b5-2b62e9a7a898/ff6d0c3c-d244-4717-b91e-6476f3a8a053
- **Status:** BLOCKED
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC007 Public dashboard agent selection navigates to an agent performance profile
- **Test Code:** [TC007_Public_dashboard_agent_selection_navigates_to_an_agent_performance_profile.py](./TC007_Public_dashboard_agent_selection_navigates_to_an_agent_performance_profile.py)
- **Test Error:** TEST FAILURE

Selecting an agent did not open the agent profile — the roster appears read-only and no profile page is accessible.

Observations:
- Clicking Alice Thompson's progress percent and the row chevron did not navigate or reveal a profile page.
- The page displays 'Demo Mode (Read-Only)' and an 'Admin Console (Locked)' button, indicating the public demo is not interactive for profile views.
- No agent profile link, header, or profile content was displayed after interacting with roster items.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/d8dd49e7-39d1-4adf-a2b5-2b62e9a7a898/2f941b10-c03e-4515-99b2-7b0af91aaa5c
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC008 Admin edits an existing agent goal and sees roster summary update
- **Test Code:** [TC008_Admin_edits_an_existing_agent_goal_and_sees_roster_summary_update.py](./TC008_Admin_edits_an_existing_agent_goal_and_sees_roster_summary_update.py)
- **Test Error:** TEST BLOCKED

The feature cannot be reached because the web application server is not responding.

Observations:
- Navigating to /demo returned a browser error: ERR_EMPTY_RESPONSE.
- The page shows 'localhost didn\'t send any data.' and only a Reload button is available.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/d8dd49e7-39d1-4adf-a2b5-2b62e9a7a898/4b2db126-cd59-4784-a104-5baca62febd1
- **Status:** BLOCKED
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC009 Agent profile transaction list can be filtered by status
- **Test Code:** [TC009_Agent_profile_transaction_list_can_be_filtered_by_status.py](./TC009_Agent_profile_transaction_list_can_be_filtered_by_status.py)
- **Test Error:** TEST FAILURE

A public viewer could not access an agent's transaction history or status filters on the demo dashboard.

Observations:
- The Demo Roster is visible, but clicking the agent expand controls did not open any transaction list or filter UI.
- No transaction history panel or status filter controls (e.g., 'Closed' or 'Pending') are present on the page after multiple attempts to open agent profiles.
- I attempted to open Alice Thompson 4 times and Bob Roberts 1 time; neither attempt revealed transaction details.

- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/d8dd49e7-39d1-4adf-a2b5-2b62e9a7a898/967c5741-f891-44d8-a606-a9ed67e643f7
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC010 Ensure public dashboard does not show admin-only controls
- **Test Code:** [TC010_Ensure_public_dashboard_does_not_show_admin_only_controls.py](./TC010_Ensure_public_dashboard_does_not_show_admin_only_controls.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/d8dd49e7-39d1-4adf-a2b5-2b62e9a7a898/d601a498-e804-4fb0-9c87-4c5e2993d42d
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC011 TV-optimized mode remains stable during extended viewing
- **Test Code:** [TC011_TV_optimized_mode_remains_stable_during_extended_viewing.py](./TC011_TV_optimized_mode_remains_stable_during_extended_viewing.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/d8dd49e7-39d1-4adf-a2b5-2b62e9a7a898/d7f8a40e-0876-4fdb-b8d5-278c7a14b735
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC012 Request password reset shows confirmation
- **Test Code:** [TC012_Request_password_reset_shows_confirmation.py](./TC012_Request_password_reset_shows_confirmation.py)
- **Test Error:** TEST FAILURE

Administrator password recovery cannot be completed because the UI does not expose a login or password reset flow.

Observations:
- No 'login', 'sign in', or 'forgot password' link was visible on the landing or demo pages.
- The team selection repeatedly stayed on the landing page or led to onboarding/demo; no admin login screen appeared.
- A search/scroll for 'login'/'forgot' returned no results.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/d8dd49e7-39d1-4adf-a2b5-2b62e9a7a898/cfc29fef-6bae-4e1b-b970-57231610db7f
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC013 Roster form validates invalid goal inputs for an agent
- **Test Code:** [TC013_Roster_form_validates_invalid_goal_inputs_for_an_agent.py](./TC013_Roster_form_validates_invalid_goal_inputs_for_an_agent.py)
- **Test Error:** TEST BLOCKED

The onboarding flow could not be reached from the landing page, so the test cannot proceed to create a team, create an admin, or exercise roster validation.

Observations:
- Submitting the team subdomain (clicking GO) kept the app on the landing page and did not show onboarding fields (company name, admin email, etc.).
- The team name input remains populated with 'teamgoalsvalidate' but no navigation or onboarding form appears.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/d8dd49e7-39d1-4adf-a2b5-2b62e9a7a898/a2e68493-42a9-465e-b95b-54d09c669452
- **Status:** BLOCKED
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC014 Onboarding rejects non-numeric or negative goals
- **Test Code:** [TC014_Onboarding_rejects_non_numeric_or_negative_goals.py](./TC014_Onboarding_rejects_non_numeric_or_negative_goals.py)
- **Test Error:** TEST BLOCKED

The feature could not be reached — the Cloudflare protection overlay prevents submitting the onboarding form.

Observations:
- A Cloudflare iframe overlay saying 'Unable to connect to website' is visible and sits over the Finish & Launch area.
- The Annual Team Volume Goal field contains an invalid negative value (-1000000), but I could not click 'FINISH & LAUNCH' to verify validation because the overlay blocks interaction.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/d8dd49e7-39d1-4adf-a2b5-2b62e9a7a898/e70880b5-ee6f-4fca-a393-4c5b6676806e
- **Status:** BLOCKED
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC015 Onboarding blocks submission when required fields are missing
- **Test Code:** [TC015_Onboarding_blocks_submission_when_required_fields_are_missing.py](./TC015_Onboarding_blocks_submission_when_required_fields_are_missing.py)
- **Test Error:** TEST FAILURE

The onboarding flow could not be started from the homepage; submitting the team subdomain did not open the onboarding form.

Observations:
- Clicking the 'GO' button and pressing Enter did not navigate away from the homepage.
- The page still shows the team subdomain input with the value 'acme-team'.
- No onboarding form or company name field is visible.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/d8dd49e7-39d1-4adf-a2b5-2b62e9a7a898/e903fd0d-b106-4efb-9939-e44e8590f56c
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---


## 3️⃣ Coverage & Matching Metrics

- **20.00** of tests passed

| Requirement        | Total Tests | ✅ Passed | ❌ Failed  |
|--------------------|-------------|-----------|------------|
| ...                | ...         | ...       | ...        |
---


## 4️⃣ Key Gaps / Risks
{AI_GNERATED_KET_GAPS_AND_RISKS}
---