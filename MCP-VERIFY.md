# MCP Configuration Verification

Verification run: 2026-07-21

## Tool Call Results

### 1. `brave_web_search` — query: "GitHub Copilot coding agent MCP"

**Result: TOOL UNAVAILABLE**

Error received:

```
422 SUBSCRIPTION_TOKEN_INVALID — The provided subscription token is invalid. (component: authentication)
```

### 2. context7 `resolve-library-id` — library: "Next.js"

**Result: SUCCESS**

Top library ID returned: `/vercel/next.js`

Full top match:
- Title: Next.js
- Library ID: `/vercel/next.js`
- Description: Next.js enables you to create full-stack web applications by extending the latest React features and integrating powerful Rust-based JavaScript tooling for the fastest builds.
- Code Snippets: 6025
- Source Reputation: High
- Benchmark Score: 88.83

### 3. `perplexity_search` — query: "Model Context Protocol"

**Result: SUCCESS — 10 results returned**

First result:
- **Title:** Model Context Protocol
- **URL:** https://modelcontextprotocol.io/docs/getting-started/intro
- **Snippet:** MCP (Model Context Protocol) is an open-source standard for connecting AI applications to external systems. Using MCP, AI applications like Claude or ChatGPT can connect to data sources (e.g. local files, databases), tools (e.g. search engines, calculators) and workflows (e.g. specialized prompts) — enabling them to access key information and perform tasks.

---

## All Available MCP Tools in This Session

### brave-search
- `brave_local_search`
- `brave_news_search`
- `brave_web_search`

### context7
- `context7-resolve-library-id` (resolve-library-id)
- Query Documentation (implicit)

### perplexity
- `perplexity_ask`
- `perplexity_reason`
- `perplexity_research`
- `perplexity_search`

### playwright (browser automation)
- `browser_click`
- `browser_close`
- `browser_console_messages`
- `browser_drag`
- `browser_evaluate`
- `browser_file_upload`
- `browser_fill_form`
- `browser_handle_dialog`
- `browser_hover`
- `browser_install`
- `browser_navigate`
- `browser_navigate_back`
- `browser_network_requests`
- `browser_press_key`
- `browser_resize`
- `browser_select_option`
- `browser_snapshot`
- `browser_tabs`
- `browser_take_screenshot`
- `browser_type`
- `browser_wait_for`

### github-mcp-server (GitHub)
- `actions_get` (get_workflow, get_workflow_run, get_workflow_job, download_workflow_run_artifact, get_workflow_run_usage, get_workflow_run_logs_url)
- `actions_list` (list_workflows, list_workflow_runs, list_workflow_jobs, list_workflow_run_artifacts)
- `get_code_scanning_alert`
- `get_commit`
- `get_discussion`
- `get_discussion_comments`
- `get_file_contents`
- `get_job_logs`
- `get_label`
- `get_latest_release`
- `get_release_by_tag`
- `get_secret_scanning_alert`
- `get_tag`
- `issue_read`
- `list_branches`
- `list_code_scanning_alerts`
- `list_commits`
- `list_discussion_categories`
- `list_discussions`
- `list_issue_fields`
- `list_issue_types`
- `list_issues`
- `list_label`
- `list_pull_requests`
- `list_releases`
- `list_repository_collaborators`
- `list_secret_scanning_alerts`
- `list_tags`
- `pull_request_read`
- `search_code`
- `search_commits`
- `search_issues`
- `search_pull_requests`
- `search_repositories`
- `search_users`

### engine-tools (built-in agent tools)
- `reply_to_comment`
- `report_progress`

### runtime-tools (built-in runtime tools)
- `gh-advisory-database`
- `secret_scanning`
- `store_memory`
- `vote_memory`

### Core agent tools
- `bash` / `read_bash` / `stop_bash` / `list_bash`
- `view` / `create` / `edit`
- `glob` / `grep`
- `web_fetch`
- `skill`
- `sql` / `session_store_sql`
- `read_agent` / `list_agents` / `task`
- `parallel_validation`
- `search_code_subagent`
- `web_search`
