# API Contract: Vercel Deployments API

## POST /v13/deployments — Create Deployment

### Description
Triggers a new Vercel deployment from a GitHub commit SHA. Vercel builds the project on its own infrastructure (no GitHub Actions build environment mismatch).

### Authentication
Bearer token via `Authorization: Bearer $VERCEL_TOKEN`

### Request

**Query Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| teamId | string | yes | Vercel team ID (from `VERCEL_ORG_ID` secret) |

**Request Body:**
```json
{
  "name": "esg-hub",
  "project": "<VERCEL_PROJECT_ID>",
  "target": "production",
  "gitSource": {
    "type": "github",
    "repoId": "1160033656",
    "ref": "<github.ref_name>",
    "sha": "<github.sha>"
  }
}
```

### Response

**Success (200 OK):**
```json
{
  "id": "dpl_abc123...",
  "url": "esg-hub-ascent.vercel.app",
  "readyState": "QUEUED",
  "createdAt": 1234567890
}
```

**Error Codes:**
| Status | Code | When |
|--------|------|------|
| 400 | BAD_REQUEST | Missing required fields or invalid project ID |
| 401 | UNAUTHORIZED | Invalid or expired `VERCEL_TOKEN` |
| 403 | FORBIDDEN | Token lacks deploy permission or wrong team |
| 404 | NOT_FOUND | Project ID does not exist |

---

## GET /v13/deployments/{id} — Get Deployment Status

### Description
Poll deployment status until `READY`, `ERROR`, or `CANCELED`. Used after triggering a deployment.

### Authentication
Bearer token via `Authorization: Bearer $VERCEL_TOKEN`

### Request

**Path Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| id | string | yes | Deployment ID from POST response (e.g., `dpl_abc123`) |

**Query Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| teamId | string | yes | Vercel team ID |

### Response

**Success (200 OK):**
```json
{
  "id": "dpl_abc123...",
  "url": "esg-hub-ascent.vercel.app",
  "readyState": "READY",
  "createdAt": 1234567890,
  "readyAt": 1234567999
}
```

**Valid `readyState` values:**
| State | Meaning |
|-------|---------|
| `QUEUED` | Waiting for build slot |
| `BUILDING` | Actively building |
| `READY` | Build complete, deployed |
| `ERROR` | Build or deploy failed |
| `CANCELED` | Deployment was canceled |

### Polling Contract
- **Interval:** 10 seconds between polls
- **Max polls:** 30 (5 minutes total)
- **On `READY`:** Exit 0, proceed to E2E tests
- **On `ERROR` or `CANCELED`:** Exit 1 immediately ("Deployment failed with state: {state}")
- **On timeout (30 polls without READY):** Exit 1 ("Timed out waiting for deployment")

### AC Coverage
- AC-3: Production deployment triggers via POST and polls via GET until READY
- AC-E1: Timeout after 30 polls → exit 1
- AC-E2: ERROR/CANCELED state → exit 1 immediately

---

> **SUPERSEDED 2026-07-19** — The API gitSource trigger was replaced by prebuilt-in-CI (`vercel build --prod` + `vercel deploy --prebuilt --prod` in the GitHub Actions deploy job) because `file:../tool_package` deps are unavailable on Vercel's builders. See `specs/ci-cd-process/spec.md` v1.2 amendment and `specs/dev-env-automation/contracts/deploy-workflow.md`.
