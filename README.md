# Contract Analysis System

A powerful contract analysis system that uses AI to process and analyze contract documents, metadata, and category information. The system can answer questions about contracts, vendors, and categories using natural language.

## Features

- Upload and process multiple contract documents (PDF)
- Process contract metadata and category information (XLSX)
- Interactive chat interface for asking questions about contracts
- AI-powered analysis using LangChain
- Dual UI options:
  - Modern React frontend with a clean UI
  - Streamlit interface for quick deployment
- FastAPI WebSocket backend for real-time communication
- Dark/Light mode support
- Responsive design with mobile support

## Prerequisites

- Python 3.8+
- Node.js 14+
- OpenAI API key
- Google AI API key (for embeddings)

## Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd <repository-name>
```

2. Set up the backend:
```bash
cd serverside
python -m venv venv
source venv/bin/activate  # On Windows: .\venv\Scripts\activate
pip install -r requirements.txt
```

3. Create a `.env` file in the `serverside` directory:
```env
OPENAI_API_KEY=your_api_key_here
GOOGLE_API_KEY=your_google_api_key_here
```

4. Set up the React frontend:
```bash
cd ../clientside
npm install
```

## Running the Application

You can choose between two UI options:

### Option 1: React UI

1. Start the FastAPI WebSocket backend:
```bash
cd serverside
source venv/bin/activate  # On Windows: .\venv\Scripts\activate
python main.py
```

2. Start the React frontend development server:
```bash
cd clientside
npm start
```

3. Open your browser and navigate to `http://localhost:3000`

### Option 2: Streamlit UI

1. Start the Streamlit application:
```bash
cd serverside
source venv/bin/activate  # On Windows: .\venv\Scripts\activate
streamlit run app.py
```

2. Open your browser and navigate to `http://localhost:8501`

## Architecture

### Frontend
- React 19.0.0
- TailwindCSS for styling
- Framer Motion for animations
- WebSocket for real-time communication
- React Router for navigation
- Dark/Light mode support
- Responsive design
- Alternative Streamlit interface

### Backend
- FastAPI with WebSocket support
- LangChain for document processing
- LangGraph for agent framework
- FAISS for vector storage
- Google Generative AI for embeddings
- OpenAI GPT-4 for language processing

## File Format Requirements

### Contract Metadata (XLSX)
The metadata file should contain columns such as:
- contract_id
- vendor_name
- expiry_date
- notice_period
- etc.

### Category Tree (XLSX)
The category file should contain columns such as:
- category
- supplier_no
- etc.

## Development Notes

- The React UI includes a modern chat interface with typing indicators and message animations
- WebSocket connection provides real-time communication
- Responsive sidebar for document management
- Dark/Light mode toggle with system preference detection
- File upload supports PDF and XLSX formats
- Both UIs (React and Streamlit) share the same backend functionality 
