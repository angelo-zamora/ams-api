# AMS API — Azure Functions Backend

A Node.js Azure Functions v4 backend that provides REST APIs for the Attendance Management System (AMS). All endpoints are secured with Microsoft Entra ID (Azure AD) token validation.

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Project Structure](#project-structure)
- [Local Setup](#local-setup)
- [Environment Configuration](#environment-configuration)
- [Running Locally](#running-locally)
- [API Endpoints](#api-endpoints)
- [Testing with Postman](#testing-with-postman)
- [Deployment to Azure](#deployment-to-azure)

---

## Prerequisites

| Tool | Version | Download |
|------|---------|----------|
| Node.js | 18.x or later | https://nodejs.org |
| Azure Functions Core Tools | v4.x | https://learn.microsoft.com/en-us/azure/azure-functions/functions-run-local |
| Azure CLI | Latest | https://learn.microsoft.com/en-us/cli/azure/install-azure-cli |
| Git | Latest | https://git-scm.com |

Install Azure Functions Core Tools:
```bash
npm install -g azure-functions-core-tools@4 --unsafe-perm true
```

---

## Project Structure

```
Functions/
├── src/
│   ├── functions/
│   │   ├── AttendanceCheckIn.js     # POST/GET attendance records
│   │   ├── GetAttendanceHistory.js  # GET attendance history with filters
│   │   └── GetEmployees.js          # GET employee list with filters
│   ├── utils/
│   │   └── auth.js                  # Microsoft Entra ID token validation
│   └── index.js                     # Function app entry point
├── employees.json                   # Mock employee data (local DB)
├── attendance.json                  # Auto-generated attendance records (local DB)
├── host.json                        # Azure Functions host configuration
├── local.settings.json              # Local environment variables (NOT committed)
└── package.json
```

---

## Local Setup

### 1. Clone the repository

```bash
git clone https://github.com/angelo-zamora/ams-api.git
cd ams-api
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `local.settings.json` file in the root of the project (this file is gitignored):

```json
{
  "IsEncrypted": false,
  "Values": {
    "AzureWebJobsStorage": "",
    "FUNCTIONS_WORKER_RUNTIME": "node",
    "ENTRA_TENANT_ID": "<your-azure-tenant-id>",
    "ENTRA_CLIENT_ID": "<your-azure-app-client-id>"
  }
}
```

> **Where to find these values:**
> - `ENTRA_TENANT_ID` — Azure Portal → Azure Active Directory → Overview → **Tenant ID**
> - `ENTRA_CLIENT_ID` — Azure Portal → App Registrations → your app → **Application (client) ID**

---

## Environment Configuration

### Azure App Registration Setup

Before running locally, ensure your Azure App Registration is configured:

1. Go to [Azure Portal → App Registrations](https://portal.azure.com/#view/Microsoft_AAD_IAM/ActiveDirectoryMenuBlade/~/RegisteredApps)
2. Select your app registration

**Authentication tab:**
- Add a **Single-page application** platform
- Add Redirect URI: `https://oauth.pstmn.io/v1/callback` (for Postman testing)

**Expose an API tab:**
- Set Application ID URI: `api://<ENTRA_CLIENT_ID>`
- Add a scope named `access_as_user`
  - Who can consent: `Admins and users`

**API Permissions tab:**
- Add permission → My APIs → your app → `access_as_user`
- Click **Grant admin consent**

---

## Running Locally

Start the Azure Functions runtime:

```bash
npm start
# or
func start
```

The functions will be available at:
```
http://localhost:7071/api/
```

---

## API Endpoints

All endpoints require a valid Microsoft Entra ID Bearer token in the `Authorization` header:
```
Authorization: Bearer <access_token>
```

### `GET /api/AttendanceCheckIn`
Returns the authenticated user's attendance records.

**Response:**
```json
{
  "user": { "id": "...", "name": "...", "email": "..." },
  "records": [ { "id": "...", "type": "check-in", "timestamp": "...", "location": "..." } ]
}
```

---

### `POST /api/AttendanceCheckIn`
Records a new check-in or check-out for the authenticated user.

**Request Body:**
```json
{
  "type": "check-in",       // Required: "check-in" or "check-out"
  "location": "Main Office", // Optional
  "notes": "On time"         // Optional
}
```

**Response `201`:**
```json
{
  "message": "Attendance successfully recorded.",
  "record": { "id": "...", "type": "check-in", "timestamp": "...", ... }
}
```

---

### `GET /api/GetAttendanceHistory`
Returns attendance records with optional filters.

**Query Parameters:**

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `userId` | string | Filter by a specific user's Object ID | `?userId=abc-123` |
| `month` | string | Filter by exact month (`YYYY-MM`) | `?month=2026-06` |
| `startMonth` | string | Start of month range (`YYYY-MM`) | `?startMonth=2026-01` |
| `endMonth` | string | End of month range (`YYYY-MM`) | `?endMonth=2026-06` |

**Response:**
```json
{
  "items": [ { ... } ],
  "total": 10
}
```

---

### `GET /api/GetEmployees`
Returns the employee list with optional filters.

**Query Parameters:**

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `name` | string | Search by first or last name (partial, case-insensitive) | `?name=john` |
| `department` | string | Filter by department (exact match, case-insensitive) | `?department=Engineering` |
| `office` | string | Filter by office location (exact match, case-insensitive) | `?office=Manila` |

**Response:**
```json
{
  "items": [ { "id": "...", "firstName": "...", "lastName": "...", "department": "...", "office": "..." } ],
  "total": 5
}
```

---

## Testing with Postman

### Step 1: Get an Access Token

1. Open Postman → New Request → **Authorization** tab
2. Set **Type** to `OAuth 2.0`
3. Click **Get New Access Token** and fill in:

| Field | Value |
|-------|-------|
| Grant Type | `Authorization Code (With PKCE)` |
| Callback URL | `https://oauth.pstmn.io/v1/callback` |
| Authorize using browser | ✅ Checked |
| Auth URL | `https://login.microsoftonline.com/<ENTRA_TENANT_ID>/oauth2/v2.0/authorize` |
| Access Token URL | `https://login.microsoftonline.com/<ENTRA_TENANT_ID>/oauth2/v2.0/token` |
| Client ID | `<ENTRA_CLIENT_ID>` |
| Scope | `api://<ENTRA_CLIENT_ID>/access_as_user` |
| Code Challenge Method | `SHA-256` |

4. Click **Get New Access Token** → sign in with your Microsoft/Teams account
5. Click **Use Token**

### Step 2: Call an Endpoint

```
GET http://localhost:7071/api/GetEmployees
Authorization: Bearer <your_token>
```

---

## Deployment to Azure

### Step 1: Login to Azure

```bash
az login
```

### Step 2: Create Azure Resources (first time only)

```bash
# Create a resource group
az group create --name ams-rg --location southeastasia

# Create a storage account (required by Azure Functions)
az storage account create \
  --name amsstorage \
  --location southeastasia \
  --resource-group ams-rg \
  --sku Standard_LRS

# Create the Function App
az functionapp create \
  --resource-group ams-rg \
  --consumption-plan-location southeastasia \
  --runtime node \
  --runtime-version 18 \
  --functions-version 4 \
  --name ams-api \
  --storage-account amsstorage
```

### Step 3: Set Environment Variables in Azure

```bash
az functionapp config appsettings set \
  --name ams-api \
  --resource-group ams-rg \
  --settings \
    ENTRA_TENANT_ID="<your-tenant-id>" \
    ENTRA_CLIENT_ID="<your-client-id>"
```

### Step 4: Deploy

```bash
func azure functionapp publish ams-api
```

After deployment, your API will be live at:
```
https://ams-api.azurewebsites.net/api/
```

### Step 5: Update Postman Auth URLs

Replace `localhost:7071` with your live URL, and update the **Auth URL** and **Token URL** in Postman to use your specific **Tenant ID** instead of `common`.

---

## Common Errors

| Error | Cause | Fix |
|-------|-------|-----|
| `ENTRA_CLIENT_ID is not configured` | Missing `local.settings.json` | Create the file with correct values |
| `Token validation failed` | Wrong tenant/client ID or expired token | Re-acquire token in Postman |
| `AADSTS50011: Redirect URI mismatch` | URI not registered in Azure | Add `https://oauth.pstmn.io/v1/callback` to App Registration → Authentication |
| `AADSTS65001: No consent` | Scope not granted | Grant admin consent in Azure Portal → API Permissions |
| `func: command not found` | Core Tools not installed | Run `npm install -g azure-functions-core-tools@4` |
