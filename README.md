# AMS API - Azure Functions Backend

Node.js Azure Functions v4 backend for the Attendance Management System (AMS). HTTP endpoints validate Microsoft Entra ID access tokens before processing requests.

## Prerequisites

| Tool | Version |
|------|---------|
| Node.js | 22.14.0 or later |
| Azure Functions Core Tools | v4.x |
| Azure CLI | Latest |
| Visual Studio Code | Latest (required for Microsoft 365 Agents Toolkit deployment) |

Install Azure Functions Core Tools if needed:

```bash
npm install -g azure-functions-core-tools@4 --unsafe-perm true
```

## Project Structure

```
Functions/
├── src/
│   ├── config/                 # Application, database, Graph, mail, and API configuration
│   ├── controllers/            # Attendance and overtime request handling
│   ├── database/               # Database connection and factory
│   ├── dto/                    # Response data-transfer objects
│   ├── functions/              # Azure Function registrations
│   │   ├── Attendance/         # GetAttendanceToday
│   │   ├── ClockIn/            # ClockIn
│   │   ├── ClockOut/           # clockout
│   │   ├── Leave/              # leave and getLeaveRequestByDate
│   │   ├── Overtime/            # overtime and getOvertime
│   │   └── *Reminder/           # Scheduled reminder functions
│   ├── graph/                  # Microsoft Graph integration
│   ├── helpers/                # API, date, locale, logging, and response helpers
│   ├── middleware/             # Authentication middleware
│   ├── models/                # Database models
│   ├── repositories/           # Data-access repositories
│   ├── services/               # Business and integration services
│   ├── utils/                  # Graph client and JWT validation
│   ├── validators/              # Request validation
│   └── index.js                 # Function app entry point
├── employees.json              # Local employee data, when applicable
├── host.json                   # Azure Functions host configuration
├── local.settings.json.example # Environment variable template
├── package.json
└── test/                       # Automated tests
```

## Local Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create the local settings file from the template. `local.settings.json` is gitignored and must not be committed:

   ```powershell
   Copy-Item local.settings.json.example local.settings.json
   ```

3. Open `local.settings.json` and fill in the required values for Azure, the database, Graph, email, attendance API, and reminders. Keep the setting names from the example file unchanged.

## Environment Configuration

`local.settings.json.example` is the source of truth for the current environment configuration. Important groups include:

- `AZURE_TENANT_ID`, `AZURE_CLIENT_ID`, and `AZURE_CLIENT_SECRET` for Entra ID and Microsoft Graph
- `API_CLIENT_ID` for API token audience validation
- `DB_*` and `DB_CONNECT_STRING` for the database
- `ATTENDANCE_API_*` for the attendance API
- `ATTENDANCE_MAIL`, `SYSTEM_MAIL`, and `TEAMS_SERVICE_URL` for notifications and Bot Framework integration
- `BOT_REMINDER_*` and `ENABLE_*_REMINDER` for reminder jobs
- `TIMEZONE` for date and schedule handling

### Azure App Registration

Configure the app registration used by the API and Postman:

1. Register the Postman callback URI `https://oauth.pstmn.io/v1/callback` under **Authentication**.
2. Under **Expose an API**, configure the application ID URI and the API scope required by the Postman collection.
3. Grant the required delegated permissions and admin consent.

## Running Locally

```bash
npm start
```

The API is available at `http://localhost:7071/api/`.

## API Endpoints

All HTTP endpoints require a bearer token. The current routes are:

| Method | Route | Purpose |
|--------|-------|---------|
| POST | `/api/ClockIn` | Clock in |
| POST | `/api/clockout` | Clock out |
| GET | `/api/GetAttendanceToday` | Get today's attendance |
| POST | `/api/leave` | Submit a leave request |
| GET | `/api/getLeaveRequestByDate` | Get a leave request by date |
| POST | `/api/overtime` | Submit an overtime request |
| GET | `/api/getOvertime` | Get overtime details |

Reminder functions run on their configured schedules and are not interactive API routes.

## Testing with Postman

1. Start the Functions host with `npm start`.
2. In the Postman collection, send the **Generate Token** request first.
3. Copy the returned access token into the `TEAMS_TOKEN` variable in the **AMS** Postman environment.
4. Select the **AMS** environment and send any endpoint request. The requests use `TEAMS_TOKEN` as the bearer token.

If token generation fails, verify the tenant, client ID, API scope, callback URI, and admin consent in the app registration. Tokens must be generated again after they expire.

## Deployment to Azure

Choose one of the following deployment options.

### Option 1: Azure CLI and Functions Core Tools

1. Sign in:

   ```bash
   az login
   ```

2. Create or select an Azure resource group, storage account, and Node.js 22 Function App. The Function App must use Functions runtime v4.

3. Configure every setting required by `local.settings.json.example` in the Function App. Do not upload secrets from source control:

   ```bash
   az functionapp config appsettings set \
     --name <function-app-name> \
     --resource-group <resource-group> \
     --settings AZURE_TENANT_ID="<tenant-id>" AZURE_CLIENT_ID="<client-id>"
   ```

4. Publish from this directory:

   ```bash
   func azure functionapp publish <function-app-name>
   ```

The deployed API is available at `https://<function-app-name>.azurewebsites.net/api/`.

### Option 2: Microsoft 365 Agents Toolkit

Use this option when the Functions project is the backend for a Microsoft 365 or Teams agent.

1. Install the **Microsoft 365 Agents Toolkit** extension in VS Code and sign in to Azure and Microsoft 365.
2. Open the Microsoft 365 agent workspace that contains this Functions project. If this repository is standalone, add it as the agent's backend resource according to the workspace's toolkit configuration.
3. In the **Microsoft 365 Agents Toolkit** view, select the target environment, such as `dev`.
4. Run **Provision** to create or connect the Azure resources required by the agent and Function App.
5. Configure the Function App environment variables using the names in `local.settings.json.example`. Store secrets in the toolkit/Azure environment configuration, not in source control.
6. Run **Deploy** from the toolkit view. After deployment, use the generated Function App URL as the API base URL for the agent and Postman.
7. Send **Generate Token** in Postman again if the deployed API uses a different app registration, audience, or scope, then update `AMS.TEAMS_TOKEN`.

Toolkit commands and available resources depend on the agent project's provisioning configuration. For a standalone Functions project that is not connected to an agent workspace, use Option 1.

## Common Errors

| Error | Cause | Fix |
|-------|-------|-----|
| `AZURE_CLIENT_ID is not configured` | Missing or incomplete local/Azure settings | Copy the example file and configure the required values |
| `Token validation failed` | Wrong audience, tenant, or expired token | Run **Generate Token** again and update `AMS.TEAMS_TOKEN` |
| `AADSTS50011: Redirect URI mismatch` | Postman callback URI is not registered | Add `https://oauth.pstmn.io/v1/callback` to the app registration |
| `AADSTS65001: No consent` | Required API permission was not granted | Grant admin consent in the app registration |
| `func: command not found` | Core Tools is not installed | Install Azure Functions Core Tools v4 |
