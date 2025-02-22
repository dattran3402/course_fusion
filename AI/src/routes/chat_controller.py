from fastapi import APIRouter, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.exc import SQLAlchemyError
from langchain.text_splitter import CharacterTextSplitter
from langchain.memory import ConversationBufferMemory
from langchain.chains.conversational_retrieval.base import ConversationalRetrievalChain
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_community.document_loaders import S3FileLoader, PyPDFLoader
from langchain_community.vectorstores import Qdrant
from langchain.retrievers import (
    MergerRetriever,
)
import qdrant_client
from pydantic import BaseModel
from typing import (
    List,
    Optional,
    Any
)
from configs import Config

# text embedding model
embeddings = OpenAIEmbeddings(
    openai_api_key=Config.OPENAI_API_KEY,
    model=Config.TEXT_EMBEDDINGS_MODEL
)

# large language model
llm = ChatOpenAI(
    openai_api_key=Config.OPENAI_API_KEY,
    temperature=0,
    model_name=Config.LLM_MODEL,
    streaming=True
)

# qdrant client
client = qdrant_client.QdrantClient(
    Config.QDRANT_CLUSTER_ENDPOINT,
    # For Qdrant Cloud, None for local instance
    api_key=Config.QDRANT_CLUSTER_API_KEY,
)

def get_vector_store(document_id):
    try:
        if client.collection_exists(document_id):
            # connect to cloud database
            vectorstore = Qdrant(
                client=client,
                collection_name=document_id,
                embeddings=embeddings,
            )

            return vectorstore
        else:
            return False
    except:
        return False


def save_vector_store_to_db(documents, document_id):
    # connect to cloud database
    vectorstore = Qdrant.from_documents(
        documents,
        embeddings,
        url=Config.QDRANT_CLUSTER_ENDPOINT,
        prefer_grpc=True,
        api_key=Config.QDRANT_CLUSTER_API_KEY,
        collection_name=document_id,
    )

    return vectorstore

# def get_conversation_chain(retriever):
#     memory = ConversationBufferMemory(
#         memory_key='chat_history', return_messages=True)

#     conversation_chain = ConversationalRetrievalChain.from_llm(
#         llm=llm,
#         retriever=retriever,
#         memory=memory
#     )

#     return conversation_chain

async def generate_chat_responses(question, retriever, chat_history):
    memory = ConversationBufferMemory(
        memory_key='chat_history', 
        return_messages=True,
        output_key='answer'
    )
    for chat in chat_history:
        memory.save_context({"Human": chat[0]}, {"Assistant": chat[1]})

    conversation_chain = ConversationalRetrievalChain.from_llm(
        llm=llm,
        retriever=retriever,
        verbose=True,
        memory=memory,
        return_source_documents=True
    )
    
    return conversation_chain({'question': question})

router = APIRouter(prefix="/api", tags=["API"])

class EmbeddingRequest(BaseModel):
    document_id: str
    title: Optional[str] = ""
    section_id: Optional[str] = ""
    section_title: Optional[str] = ""

@router.post("/embedding")
async def embedding_document(request: EmbeddingRequest):
    try:
        document_id = request.document_id
        title = request.title
        section_id = request.section_id
        section_title = request.section_title

        # check if collection has been created
        if client.collection_exists(document_id):
            return {
                "status": status.HTTP_200_OK,
                "message": "Document has been embedded previously!"
            }
        
        url = Config.BASE_API_URL + "/document/view/" + document_id
        print("url", url)
        loader = PyPDFLoader(url)

        pages = loader.load()
        
        # split content into smaller chunks
        text_splitter = CharacterTextSplitter(
            chunk_size=1000, chunk_overlap=0)
        documents = text_splitter.split_documents(pages)
        for document in documents:
            document.metadata={
                "document_id": document_id,
                "title": title,
                "section_id": section_id,
                "section_title": section_title,
                "page": document.metadata["page"] + 1
            }

        save_vector_store_to_db(documents, document_id)

        return {
            "status": status.HTTP_200_OK,
            "message": "Embedding success!"
        }

    except SQLAlchemyError as e:
        print(f"Error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error: {str(e)}"
        )

class ChatRequest(BaseModel):
    document_ids: List[str]
    question: str
    chat_history: Optional[List[Any]] = []

@router.post("/chat")
async def chat(request: ChatRequest):
    try:
        document_ids = request.document_ids
        question = request.question
        chat_history = request.chat_history
        
        # fixxxxxxxxxxxxx
        chat_history = []
        
        multi_retrievers = []

        for document_id in document_ids:            
            vector_store = get_vector_store(document_id)
            if vector_store is not False:
                multi_retrievers.append(
                    vector_store.as_retriever(search_type="similarity", search_kwargs={"k": 2}))

        lotr = MergerRetriever(retrievers=multi_retrievers)
        
        response = await generate_chat_responses(question, lotr, chat_history)

        return {
            "status": status.HTTP_200_OK,
            "answer": response['answer'],
            "source_documents": response['source_documents']
        }

    except SQLAlchemyError as e:
        print(f"Error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="server error"
        )
