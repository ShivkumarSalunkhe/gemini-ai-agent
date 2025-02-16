from fastapi import FastAPI, WebSocket, WebSocketDisconnect, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict
import os
from PyPDF2 import PdfReader
import pandas as pd
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_google_genai import GoogleGenerativeAIEmbeddings
import google.generativeai as genai
from langchain_community.vectorstores import FAISS
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.chains.question_answering import load_qa_chain
from langchain.prompts import PromptTemplate
from dotenv import load_dotenv
import json
import asyncio

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load environment variables
load_dotenv()
os.getenv("GOOGLE_API_KEY")
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

# Reuse your existing functions
def get_pdf_text(pdf_docs):
    text = ""
    for pdf in pdf_docs:
        pdf_reader = PdfReader(pdf.file)
        for page in pdf_reader.pages:
            text += page.extract_text()
    return text

def get_excel_text(excel_files):
    text = ""
    for file in excel_files:
        df = pd.read_excel(file.file)
        text += f"\nFile: {file.filename}\n"
        text += df.to_string()
        text += "\n"
    return text

# Reuse other functions from your Streamlit app
def get_text_chunks(text):
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=10000, chunk_overlap=1000)
    chunks = text_splitter.split_text(text)
    return chunks

def get_vector_store(text_chunks):
    embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001")
    vector_store = FAISS.from_texts(text_chunks, embedding=embeddings)
    vector_store.save_local("faiss_index")

def get_conversational_chain():
    # Your existing prompt template and chain setup
    prompt_template = """
    You are a contract analysis assistant. Use the provided context to answer questions about contracts, vendors, and categories.
    For vendor and category matching, use fuzzy matching to handle similar names.
    
    When asked about:
    1. Vendor contracts - Check if the vendor exists and if they have a contract
    2. Contract clauses - Look for specific clauses in the contract text
    3. Category vendors - List all vendors in a specific category
    4. Contract expiry - Calculate days until expiry from the current date
    5. Notice periods - Extract and analyze notice period information
    
    If the information is not available in the context, clearly state that.
    
    Context:\n {context}?\n
    Question: \n{question}\n

    Answer:
    """
    
    model = ChatGoogleGenerativeAI(model="gemini-pro", temperature=0.3)
    prompt = PromptTemplate(template=prompt_template, input_variables=["context", "question"])
    return load_qa_chain(model, chain_type="stuff", prompt=prompt)

class Query(BaseModel):
    query: str

# WebSocket connection manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def send_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(json.dumps(message))

manager = ConnectionManager()

# WebSocket endpoint for chat
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            
            if message["type"] == "query":
                try:
                    embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001")
                    new_db = FAISS.load_local("faiss_index", embeddings, allow_dangerous_deserialization=True)
                    docs = new_db.similarity_search(message["content"])
                    chain = get_conversational_chain()
                    
                    response = chain(
                        {"input_documents": docs, "question": message["content"]},
                        return_only_outputs=True
                    )
                    
                    await manager.send_message({
                        "type": "response",
                        "content": response["output_text"]
                    }, websocket)
                except Exception as e:
                    await manager.send_message({
                        "type": "error",
                        "content": str(e)
                    }, websocket)
    except WebSocketDisconnect:
        manager.disconnect(websocket)

# File upload endpoint (keep this as HTTP endpoint)
@app.post("/upload")
async def upload_files(
    contract_files: List[UploadFile] = File(...),
    metadata_file: UploadFile = File(...),
    category_file: UploadFile = File(...)
):
    try:
        all_text = ""
        
        # Process PDF files
        all_text += get_pdf_text(contract_files)
        
        # Process Excel files
        all_text += get_excel_text([metadata_file, category_file])
        
        if all_text:
            text_chunks = get_text_chunks(all_text)
            get_vector_store(text_chunks)
            return {"message": "Files processed successfully"}
        
        raise HTTPException(status_code=400, detail="No content found in files")
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 