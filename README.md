# Abdul Threat Intelligence Platform

A production-ready web application for collecting, managing, and analyzing threat intelligence (IOCs) from various sources.

## Features

- **IOC Feed Management**: Add and manage IOC feeds from various sources (JSON, CSV, STIX, TAXII)
- **IOC Ingestion**: Automatically ingest IOCs from configured feeds (limited to 25 IOCs for testing)
- **Attack Map Visualization**: Visualize attack origins on an interactive map
- **STIX Graph**: Visualize STIX relationships between IOCs
- **LLM Integration**: Summarize IOCs and ask questions using local (Ollama) or external (OpenAI/Anthropic) LLMs
- **TAXII 2.1 Server**: Full TAXII 2.1 implementation for threat intelligence sharing
- **User Management**: Role-based access control with admin and user roles
- **OAuth Authentication**: Support for Google and GitHub OAuth
- **API Key Management**: Generate and manage API keys for external services

## Tech Stack

- **Backend**: Express.js, SQLite, JWT, Passport.js
- **Frontend**: React, Vite, D3.js, Cytoscape.js
- **TAXII**: TAXII 2.1 Server implementation
- **LLM**: Ollama (local) or OpenAI/Anthropic (external)

## Installation

1. **Install Node.js and npm** (if not already installed)
   - Download from https://nodejs.org/
   - Verify installation: `node --version` and `npm --version`

2. **Navigate to the project directory**
   ```bash
   cd C:\Users\Abdulmyid@gmail.com\Documents\Threatintelligence
   ```

3. **Install backend dependencies**
   ```bash
   cd server
   npm install
   ```

4. **Install frontend dependencies**
   ```bash
   cd ../client
   npm install
   ```

5. **Configure environment variables** (optional)
   - Copy `.env.example` to `.env` in the root directory
   - Update values as needed

## Running the Application

### Start the Backend Server

```bash
cd server
npm start
```

The server will run on `http://localhost:5000`

### Start the Frontend (in a new terminal)

```bash
cd client
npm run dev
```

The frontend will run on `http://localhost:5173`

## Default Login

- **Username**: `admin`
- **Password**: `admin`

## API Endpoints

### Authentication
- `POST /api/auth/admin/login` - Admin login
- `GET /api/auth/me` - Get current user

### Feeds
- `GET /api/feeds` - Get all feeds
- `POST /api/feeds` - Create new feed
- `POST /api/feeds/:id/ingest` - Ingest feed

### IOCs
- `GET /api/iocs` - Get all IOCs (with pagination)
- `GET /api/iocs/stats` - Get IOC statistics
- `GET /api/iocs/map/data` - Get data for attack map

### LLM
- `POST /api/llm/summarize` - Summarize IOCs
- `POST /api/llm/ask` - Ask questions

### TAXII 2.1
- `GET /taxii2/` - Discovery endpoint
- `GET /taxii2/collections/` - List collections
- `GET /taxii2/collections/:id/objects/` - Get objects from collection

## Default Feed

The application comes with a default IOC feed:
- **Name**: GreedyBear Honeynet
- **URL**: https://greedybear.honeynet.org/api/feeds/all/all/recent.json
- **Type**: JSON

## LLM Configuration

### Local LLM (Ollama)
1. Install Ollama from https://ollama.ai/
2. Pull a model: `ollama pull llama2`
3. Start Ollama service
4. The application will automatically use Ollama if no external API keys are configured

### External LLM
1. Go to Settings in the application
2. Add your OpenAI or Anthropic API key
3. The application will automatically use external LLM if API keys are configured

## TAXII Server

The TAXII 2.1 server is available at:
- **Discovery**: `http://localhost:5000/taxii2/`
- **API Root**: `http://localhost:5000/taxii2/api-root/`
- **Collections**: `http://localhost:5000/taxii2/collections/`
- **Test**: `http://localhost:5000/taxii2/test`

## Project Structure

```
Threatintelligence/
├── server/
│   ├── index.js
│   ├── database/
│   │   ├── db.js
│   │   └── schema.sql
│   ├── routes/
│   │   ├── auth.js
│   │   ├── feeds.js
│   │   ├── iocs.js
│   │   ├── llm.js
│   │   ├── news.js
│   │   ├── taxii.js
│   │   └── users.js
│   ├── auth/
│   │   ├── oauth.js
│   │   ├── jwt.js
│   │   └── middleware.js
│   ├── services/
│   │   ├── feedIngester.js
│   │   ├── iocParser.js
│   │   ├── stixHelper.js
│   │   ├── llmService.js
│   │   └── newsService.js
│   └── taxii/
│       ├── server.js
│       └── client.js
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── AttackMap.jsx
│   │   │   ├── STIXGraph.jsx
│   │   │   ├── FeedManager.jsx
│   │   │   ├── IOCBrowser.jsx
│   │   │   ├── LLMChat.jsx
│   │   │   ├── TaxiiClient.jsx
│   │   │   ├── Settings.jsx
│   │   │   ├── Login.jsx
│   │   │   └── Navbar.jsx
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── public/
│       └── logo.svg
└── README.md
```

## License

This project is for educational and research purposes.
<img width="1912" height="827" alt="image" src="https://github.com/user-attachments/assets/7e492d9c-18d6-482c-8dd3-ea85924af62b" />
<img width="1920" height="858" alt="image" src="https://github.com/user-attachments/assets/b0c87dae-ec00-4f25-9b64-d0879774ed12" />
<img width="1898" height="838" alt="image" src="https://github.com/user-attachments/assets/53d441ea-c558-4925-83d9-de103b5f3166" />
<img width="1910" height="843" alt="image" src="https://github.com/user-attachments/assets/bda49456-d232-4f2f-8834-f3ebf3c77032" />
<img width="1898" height="852" alt="image" src="https://github.com/user-attachments/assets/c25e270b-5a21-4356-87d7-9b3a445c4473" />

<img width="1902" height="835" alt="image" src="https://github.com/user-attachments/assets/872fe40d-715c-4931-9214-a9adccff7c89" />








