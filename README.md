# X Repost Tracker for Google Sheets

This project contains a Google Apps Script written in TypeScript that searches for tweets on X (formerly Twitter) based on criteria defined in a Google Sheet. The results are then appended to another sheet in the same Google Spreadsheet.

The project is set up for continuous deployment using GitHub Actions, with separate environments for staging (on pull requests) and production (on merges to `main`).

## Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js and npm](https://nodejs.org/)
- [Google's `clasp` CLI](https://github.com/google/clasp): Install globally via `npm install -g @google/clasp`

## Project Setup

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd twitter_tracker
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

## Configuration

### 1. Google Sheet

Create a Google Spreadsheet and set it up with the following sheets:

-   `hashtags`: A single column of hashtags to include in the search query (e.g., `#developer`, `#opensource`).
-   `words`: A single column of keywords to include in the search (e.g., `API`, `integration`).
-   `time_range`: A sheet with the start time in cell `A1` and the end time in cell `B1`. The format must be ISO 8601 `YYYY-MM-DDTHH:mm:ssZ`.
-   `Results`: An empty sheet where the script will append the search results. The script will add rows with `user_id`, `display_name`, `created_at`, and `text`.

Once the sheet is ready, replace the placeholder in `src/main.ts` with your Spreadsheet ID:
```typescript
const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID';
```

### 2. X API Credentials

This script uses the X API v2 and requires a Bearer Token for authentication.

1.  Obtain a Bearer Token from your project in the [X Developer Portal](https://developer.twitter.com/).
2.  Open the `src/main.ts` file and temporarily add your token to the `setXCredentials` function.
3.  Push the code to your Google Apps Script project: `npx clasp push`
4.  Open the project in the Google Apps Script editor: `npx clasp open`
5.  Run the `setXCredentials` function once from the editor to store the token securely as a script property.
6.  **Important**: Remove the hardcoded token from `src/main.ts` and push the changes again.

### 3. GitHub Secrets for CI/CD

The GitHub Actions workflow requires secrets to authenticate with Google and to identify the deployment targets.

1.  **Create Staging and Production Scripts**:
    -   You need two separate Google Apps Script projects: one for staging and one for production.
    -   Create them using `npx clasp create --title "X Tracker (Staging)"` and `npx clasp create --title "X Tracker (Production)"`.
    -   Note the `scriptId` for each from the `.clasp.json` file that is created.

2.  **Set GitHub Secrets**:
    -   In your GitHub repository, go to `Settings` > `Secrets and variables` > `Actions`.
    -   Create the following secrets:
        -   `CLASPRC_JSON`: The content of your local `~/.clasprc.json` file. This authorizes `clasp` to act on your behalf.
        -   `STAGING_SCRIPT_ID`: The script ID for your staging Apps Script project.
        -   `PRODUCTION_SCRIPT_ID`: The script ID for your production Apps Script project.

## Local Development

You can use `clasp` to manage your project from the command line:

-   **Push changes**: `npx clasp push`
-   **Pull changes**: `npx clasp pull`
-   **Open in browser**: `npx clasp open`

The TypeScript code in the `src` directory will be automatically compiled and pushed as JavaScript to Google Apps Script.

## Deployment

Deployment is handled automatically by GitHub Actions:

-   **Staging**: When a pull request is opened or updated, the script is automatically compiled and deployed to the staging Apps Script project specified by `STAGING_SCRIPT_ID`.
-   **Production**: When a pull request is merged into the `main` branch, the script is deployed to the production Apps Script project specified by `PRODUCTION_SCRIPT_ID`.
