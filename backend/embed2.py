from llama_index.core import (
    VectorStoreIndex,
    StorageContext,
    load_index_from_storage
)
from sentence_transformers import SentenceTransformer
from PyPDF2 import PdfReader
import os

# Initialize SentenceTransformer model
model = SentenceTransformer('all-MiniLM-L6-v2')

def extract_text_from_pdf(pdf_path):
    """
    Extract text from a PDF file using PyPDF2.
    """
    try:
        reader = PdfReader(pdf_path)
        text = ""
        for page in reader.pages:
            text += page.extract_text()
        return text
    except Exception as e:
        print(f"Error extracting text from {pdf_path}: {e}")
        return ""

def get_new_documents(existing_docs_dir, existing_filenames):
    """
    Get new documents that have been added to the directory (not already processed).
    """
    new_docs = []
    new_filenames = []
    for filename in os.listdir(existing_docs_dir):
        if filename.endswith('.pdf') and filename not in existing_filenames:
            new_filenames.append(filename)
            pdf_path = os.path.join(existing_docs_dir, filename)
            doc_content = extract_text_from_pdf(pdf_path)
            if doc_content:  # Only add documents that have content
                new_docs.append(doc_content)

    return new_docs, new_filenames

def chunk_document(content, chunk_size=500):
    """
    Split document content into chunks for embedding generation.
    """
    chunks = [content[i:i+chunk_size] for i in range(0, len(content), chunk_size)]
    return chunks

def generate_embeddings_for_chunks(chunks, model):
    """
    Generate embeddings for document chunks.
    """
    embeddings = model.encode(chunks)
    return embeddings
def incremental_update_with_llamaindex(existing_docs_dir, index_file, model):
    """
    Perform an incremental update of embeddings for newly added documents using LlamaIndex.
    """
    # Initialize or load existing index
    if os.path.exists(index_file):
        storage_context = StorageContext.from_defaults(persist_dir=index_file)
        index = load_index_from_storage(storage_context)
    else:
        # Use local embeddings (SentenceTransformer) here
        index = VectorStoreIndex([], embed_model='local:all-MiniLM-L6-v2')
    
    # Get existing filenames to avoid reprocessing
    existing_filenames = [doc['filename'] for doc in index.docstore]

    # Get new documents from the directory
    new_docs, new_filenames = get_new_documents(existing_docs_dir, existing_filenames)

    if not new_docs:
        print("No new documents to process.")
        return

    # Process each new document
    for doc_content, filename in zip(new_docs, new_filenames):
        # Split document into chunks
        chunks = chunk_document(doc_content)

        # Generate embeddings for document chunks
        chunk_embeddings = generate_embeddings_for_chunks(chunks, model)

        # Add embeddings to the vector index
        for i, chunk in enumerate(chunks):
            # Add to index (storing each chunk with its embedding)
            index.add_documents([{
                'content': chunk,
                'embedding': chunk_embeddings[i],
                'filename': filename,
            }])

    # Persist updated index
    storage_context = StorageContext.from_defaults(persist_dir=index_file)
    index.save_to_storage(storage_context)
    print(f"Successfully updated index with {len(new_docs)} new documents.")

# Example usage
if __name__ == "__main__":
    existing_docs_dir = '/Users/rahuljadhav/Documents/rag_imp-main/backend/documents'  # Directory with your documents
    index_file = '/Users/rahuljadhav/Documents/rag_imp-main/backend/vector_store_index'  # Correct path to save/load the index (should be a directory, not .json)

    # Perform the incremental update using LlamaIndex
    incremental_update_with_llamaindex(existing_docs_dir, index_file, model)





'-----------------------------------'
from llama_index.core import VectorStoreIndex, Document, StorageContext
from sentence_transformers import SentenceTransformer
from PyPDF2 import PdfReader
import os
from os import makedirs
import numpy as np  # Import NumPy for array operations

# Initialize SentenceTransformer model
model = SentenceTransformer('all-MiniLM-L6-v2')

def extract_text_from_pdf(pdf_path):
    """
    Extract text from a PDF file using PyPDF2.
    """
    try:
        reader = PdfReader(pdf_path)
        text = ""
        for page in reader.pages:
            text += page.extract_text()
        return text
    except Exception as e:
        print(f"Error extracting text from {pdf_path}: {e}")
        return ""

def chunk_document(content, chunk_size=500):
    """
    Split document content into chunks for embedding generation.
    """
    chunks = [content[i:i+chunk_size] for i in range(0, len(content), chunk_size)]
    return chunks

def generate_embeddings_for_chunks(chunks, model):
    """
    Generate embeddings for document chunks.
    """
    try:
        embeddings = model.encode(chunks)
        return embeddings
    except Exception as e:
        print(f"Error generating embeddings: {e}")
        return []

def revectorize_all_documents(existing_docs_dir, index_file, model):
    """
    Revectorizes all documents in the directory and updates the index.
    """
    # Create the directory if it doesn't exist
    makedirs(index_file, exist_ok=True)

    # Load all documents
    all_docs = []
    for filename in os.listdir(existing_docs_dir):
        if filename.endswith('.pdf'):
            pdf_path = os.path.join(existing_docs_dir, filename)
            doc_content = extract_text_from_pdf(pdf_path)
            if doc_content.strip():  # Only include documents with non-empty content
                all_docs.append({'content': doc_content, 'filename': filename})
            else:
                print(f"Skipping {filename}: No content extracted.")

    # Process documents for index creation
    documents = []
    for doc in all_docs:
        content = doc['content']
        filename = doc['filename']

        # Split document into chunks
        chunks = chunk_document(content)

        # Generate embeddings for document chunks
        chunk_embeddings = generate_embeddings_for_chunks(chunks, model)

        # Handle empty embeddings
        if len(chunk_embeddings) == 0:  # Check if embeddings list is empty
            print(f"Skipping {filename}: No embeddings generated.")
            continue

        try:
            # Flatten embeddings into a single list of floats
            document_embedding = np.mean(chunk_embeddings, axis=0).tolist()  # Use mean of embeddings
        except Exception as e:
            print(f"Error processing embeddings for {filename}: {e}")
            continue  # Skip documents with issues

        # Create Document object with content and embeddings
        try:
            document = Document(content=content, embedding=document_embedding, filename=filename)
            documents.append(document)
        except Exception as e:
            print(f"Error creating Document object for {filename}: {e}")
            continue

    # Ensure we have valid documents before creating the index
    if not documents:
        print("No valid documents to index. Exiting.")
        return

    # Create or recreate the index
    try:
        index = VectorStoreIndex.from_documents(documents, embed_model='local:all-MiniLM-L6-v2')

        # Persist updated index
        storage_context = StorageContext.from_defaults(persist_dir=index_file)
        index.save_to_storage(storage_context)
        print(f"Successfully updated index with {len(documents)} documents.")
    except ValueError as e:
        print(f"Error creating index: {e}")


# Example usage
if __name__ == "__main__":
    existing_docs_dir = '/Users/rahuljadhav/Documents/rag_imp-main/backend/documents'  # Directory with your documents
    index_file = '/Users/rahuljadhav/Documents/rag_imp-main/backend/persistent_dr'  # Correct path to save/load the index

    # Revectorize all documents and update the index
    revectorize_all_documents(existing_docs_dir, index_file, model)

