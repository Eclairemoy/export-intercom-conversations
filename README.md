# Intercom Conversations Exporter

This Node.js script exports conversations from your Intercom workspace and saves them into JSON files, handling API rate limits and pagination effectively.

## Overview

The script:

* Fetches conversations from Intercom's API
* Handles pagination and rate limits
* Saves conversations locally as structured JSON files

## Prerequisites

* Node.js (v16 or higher recommended)
* An active Intercom account
* Intercom API token with appropriate permissions

## Installation

### 1. Clone the repository

```bash
git clone <REPOSITORY_URL>
cd <REPOSITORY_DIRECTORY>
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file at the root of your project and add your Intercom API token:

```env
INTERCOM_TOKEN=your_intercom_api_token
```

Replace `your_intercom_api_token` with your actual Intercom API token.

## Running the Script

Execute the script with the following command:

```bash
npm start
```

The script will:

* Export batches of conversations
* Save each batch as `conversations_<timestamp>.json` in your project directory

## File Structure

```
project-root/
├── conversations_<timestamp>.json
├── create_conversations.js
├── package.json
└── .env
```

## Notes

* Ensure your API token has the necessary permissions.
* Adjust pagination parameters in `create_conversations.js` if needed.
* Be mindful of Intercom's API rate limits.
