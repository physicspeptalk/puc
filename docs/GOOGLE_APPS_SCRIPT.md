# Physics Pep Talk Online Test Series — Google Apps Script API Setup Guide

This guide explains how to deploy the Google Apps Script backend (`google-apps-script/Code.gs`) as a secure, lightweight, and cheat-proof API layer for the online test series.

---

## 1. Why Google Apps Script?

- **Server-Side Answer Security**: The correct answers (Column H) and question explanations (Column I) are stored strictly server-side in Google Sheets. Students **cannot** see the answer key or explanations by inspecting network requests or DOM before submitting their test.
- **Dynamic Questions**: When teachers add, update, or remove questions in Google Sheets, changes are immediately picked up by the API without needing code redeployments.
- **Zero Database Server Cost**: Uses your existing Google Spreadsheet (`14rnATEfz8Y4cQge9TzPM4QUuGocLOWhQLODL33hsvJg`) as the primary database.
- **Built-in Caching**: Includes a 5-minute memory cache via Apps Script `CacheService` to prevent hitting Google Sheets rate limits during heavy student traffic.

---

## 2. Google Sheets Tab & GID Configuration

Spreadsheet URL:
`https://docs.google.com/spreadsheets/d/14rnATEfz8Y4cQge9TzPM4QUuGocLOWhQLODL33hsvJg/edit`

| Subject | Sheet Tab Name | Sheet GID | Status / Note |
|---|---|---|---|
| **Physics** | `physics` | **`396482003`** | ✅ Verified from sheet metadata |
| **Chemistry** | `chemistry` | **`338371251`** | ✅ Verified from sheet metadata |
| **Mathematics** | `maths` | **`742477729`** | ✅ Verified from sheet metadata |
| **Biology** | `Biology` | **`1456450225`** | ✅ Verified from sheet metadata |

> ⚠️ **Configuration Notice Regarding Biology vs Physics GID**:
> In earlier documentation, Physics was accidentally listed with GID `1456450225`. Live inspection verified that `1456450225` belongs to the **Biology** tab, while the **physics** tab has GID `396482003`. The script automatically handles both tab names and GIDs.

---

## 3. Google Sheets Column Structure

Ensure each sheet tab has the following 9 columns in Row 1:

| Column | Header | Description | Required | Security |
|---|---|---|---|---|
| **A** | `SUBJECT` | Subject name (e.g. Physics) | Yes | Public |
| **B** | `TOPIC` | Topic / Chapter name (e.g. Current Electricity) | Yes | Public |
| **C** | `QUESTION` | Question text (supports math, Unicode, multiline) | Yes | Public |
| **D** | `a` (or `Option A`) | Option A text | Yes | Public |
| **E** | `b` (or `Option B`) | Option B text | Yes | Public |
| **F** | `c` (or `Option C`) | Option C text | Optional | Public |
| **G** | `d` (or `Option D`) | Option D text | Optional | Public |
| **H** | `Corrrect answer` | Correct option letter (`A`, `B`, `C`, or `D`) | Yes | **Server-side only** |
| **I** | `Explanation` | Step-by-step solution / reasoning | Optional | **Server-side only** |

---

## 4. Deployment Steps (5 Minutes)

### Step 1: Open Google Sheets Extensions
1. Open the spreadsheet in your browser:
   `https://docs.google.com/spreadsheets/d/14rnATEfz8Y4cQge9TzPM4QUuGocLOWhQLODL33hsvJg/edit`
2. In the top menu, click **Extensions** → **Apps Script**.

### Step 2: Paste the Backend Code
1. In the Apps Script code editor, delete any placeholder code in `Code.gs`.
2. Open [`google-apps-script/Code.gs`](file:///Users/nagarjunags/projects/pucboards-physicspeptalk/google-apps-script/Code.gs) in your project workspace.
3. Copy the entire file content and paste it into `Code.gs` in the Google Apps Script editor.
4. Click the **Save** (disk) icon or press `Cmd+S` / `Ctrl+S`.

### Step 3: Deploy as a Web App
1. At the top-right corner, click the blue **Deploy** button → select **New deployment**.
2. Click the gear icon (⚙️) next to *Select type* and choose **Web app**.
3. Fill in the deployment configuration:
   - **Description**: `Physics Pep Talk Test Series API v1`
   - **Execute as**: **`Me (your_email@gmail.com)`** *(Crucial: allows the script to read the sheet securely)*
   - **Who has access**: **`Anyone`** *(Crucial: allows students on the website to fetch questions without signing into a Google account)*
4. Click **Deploy**.
5. If prompted with *Authorization required*, click **Authorize access**, select your Google account, click *Advanced*, and click *Go to Untitled project (unsafe)* → **Allow**.
6. Copy the generated **Web App URL**. It will look like:
   `https://script.google.com/macros/s/AKfycbx.../exec`

---

## 5. Connecting Frontend to the Apps Script API

Add your deployed Web App URL to your environment file (`.env` or `.env.local`):

```bash
VITE_TEST_API_URL="https://script.google.com/macros/s/AKfycbx.../exec"
```

When this environment variable is present, the website automatically:
1. Calls `GET https://script.google.com/macros/s/.../exec?action=questions&subject=physics` to load questions.
2. Calls `POST https://script.google.com/macros/s/.../exec` (or GET fallback) to submit and evaluate student answers server-side.

> **Zero Configuration Fallback Mode**:
> If `VITE_TEST_API_URL` is omitted, the frontend automatically falls back to fetching directly from the spreadsheet's public CSV export with client evaluation, or uses high-yield built-in sample question banks if the spreadsheet tabs are empty!

---

## 6. Testing the API Endpoints

Once deployed, you can verify your Web App in your browser or terminal:

### 1. Health check:
```bash
curl -L "https://script.google.com/macros/s/AKfycbx.../exec?action=health"
```
Response:
```json
{"status":"ok","version":"2.0.0","timestamp":"2026-11-07T16:30:00.000Z"}
```

### 2. Fetch Physics questions (No answers or explanations exposed):
```bash
curl -L "https://script.google.com/macros/s/AKfycbx.../exec?action=questions&subject=physics"
```
Response:
```json
{
  "status": "success",
  "subject": "Physics",
  "totalQuestions": 15,
  "topics": {
    "Current Electricity": 8,
    "Ray Optics": 7
  },
  "questions": [
    {
      "id": "physics-001",
      "topic": "Current Electricity",
      "question": "The resistivity of a wire depends on its...",
      "options": {
        "A": "Length",
        "B": "Area of cross section",
        "C": "Material and temperature",
        "D": "Shape"
      }
    }
  ]
}
```

### 3. Evaluate a test submission:
```bash
curl -X POST -L \
  -H "Content-Type: application/json" \
  -d '{"subject":"physics","answers":{"physics-001":"C"},"timeSpentSeconds":45}' \
  "https://script.google.com/macros/s/AKfycbx.../exec"
```
Response:
```json
{
  "status": "success",
  "evaluation": {
    "subject": "Physics",
    "totalQuestions": 1,
    "correctAnswers": 1,
    "incorrectAnswers": 0,
    "unattempted": 0,
    "totalMarks": 1,
    "percentage": 100,
    "accuracy": 100,
    "review": [
      {
        "id": "physics-001",
        "studentAnswer": "C",
        "correctAnswer": "C",
        "isCorrect": true,
        "explanation": "Resistivity is an intrinsic material property that depends only on the nature of the material and temperature."
      }
    ]
  }
}
```
