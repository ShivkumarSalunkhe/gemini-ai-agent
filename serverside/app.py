import streamlit as st
from PyPDF2 import PdfReader
import pandas as pd
from langchain.text_splitter import RecursiveCharacterTextSplitter
import os
from langchain_google_genai import GoogleGenerativeAIEmbeddings
import google.generativeai as genai
from langchain_community.vectorstores import FAISS
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.chains.question_answering import load_qa_chain
from langchain.prompts import PromptTemplate
from dotenv import load_dotenv
from datetime import datetime, timedelta

load_dotenv()
os.getenv("GOOGLE_API_KEY")
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

def get_pdf_text(pdf_docs):
    text = ""
    for pdf in pdf_docs:
        pdf_reader = PdfReader(pdf)
        for page in pdf_reader.pages:
            text += page.extract_text()
    return text

def get_excel_text(excel_files):
    text = ""
    for file in excel_files:
        df = pd.read_excel(file)
        # Convert DataFrame to string representation
        text += f"\nFile: {file.name}\n"
        text += df.to_string()
        text += "\n"
    return text

def get_text_chunks(text):
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=10000, chunk_overlap=1000)
    chunks = text_splitter.split_text(text)
    return chunks

def get_vector_store(text_chunks):
    embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001")
    vector_store = FAISS.from_texts(text_chunks, embedding=embeddings)
    vector_store.save_local("faiss_index")

def get_conversational_chain():
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

    model = ChatGoogleGenerativeAI(model="gemini-pro",
                                  temperature=0.3)

    prompt = PromptTemplate(template=prompt_template, input_variables=["context", "question"])
    chain = load_qa_chain(model, chain_type="stuff", prompt=prompt)
    return chain

def user_input(user_question):
    embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001")
    new_db = FAISS.load_local("faiss_index", embeddings, allow_dangerous_deserialization=True)
    docs = new_db.similarity_search(user_question)
    chain = get_conversational_chain()
    
    response = chain(
        {"input_documents": docs, "question": user_question},
        return_only_outputs=True
    )
    st.write("Reply: ", response["output_text"])

def main():
    st.set_page_config("Contract Analysis System")
    st.header("Contract and Vendor Analysis System using Gemini💁")

    user_question = st.text_input("Ask a Question about Contracts, Vendors, or Categories")

    if user_question:
        user_input(user_question)

    with st.sidebar:
        st.title("Upload Documents")
        
        # Single uploader for all document types
        uploaded_files = st.file_uploader(
            "Upload Contract Documents (PDF) and Metadata Files (XLSX)",
            type=['pdf', 'xlsx'],
            accept_multiple_files=True,
            help="You can upload multiple files: Contract PDFs, Contract Database (XLSX), and Category Tree (XLSX)"
        )

        if st.button("Submit & Process"):
            with st.spinner("Processing..."):
                # Combine text from all sources
                all_text = ""
                
                if uploaded_files:
                    # Separate files by type
                    excel_files = [f for f in uploaded_files if f.name.endswith('.xlsx')]
                    pdf_files = [f for f in uploaded_files if f.name.endswith('.pdf')]
                    
                    # Process Excel files
                    if excel_files:
                        all_text += get_excel_text(excel_files)
                    
                    # Process PDF files
                    if pdf_files:
                        all_text += get_pdf_text(pdf_files)
                    
                    if all_text:
                        text_chunks = get_text_chunks(all_text)
                        get_vector_store(text_chunks)
                        st.success("All documents processed successfully!")
                else:
                    st.warning("Please upload at least one document to process.")

if __name__ == "__main__":
    main()