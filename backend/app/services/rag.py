import hashlib
import logging
from pathlib import Path

from pypdf import PdfReader
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_community.vectorstores import FAISS
from langchain.text_splitter import RecursiveCharacterTextSplitter

from app.config import GEMINI_API_KEY

logger = logging.getLogger(__name__)

DATA_DIR  = Path(__file__).resolve().parent.parent / "data"
CV_PATH   = Path(__file__).resolve().parent.parent.parent.parent / "src" / "assets" / "cv.pdf"
FAISS_DIR = DATA_DIR / "faiss_index"
HASH_FILE = DATA_DIR / "cv.hash"

_embeddings = GoogleGenerativeAIEmbeddings(
    model="models/embedding-001",
    google_api_key=GEMINI_API_KEY,
)

_retriever = None


def _cv_hash() -> str:
    return hashlib.md5(CV_PATH.read_bytes()).hexdigest()


def _extract_pdf_text() -> str:
    reader = PdfReader(str(CV_PATH))
    return "\n\n".join(page.extract_text() or "" for page in reader.pages)


def _build_and_cache() -> FAISS:
    logger.info("Building FAISS index from cv.pdf …")
    text = _extract_pdf_text()

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=600,
        chunk_overlap=80,
        separators=["\n\n", "\n", ". ", " ", ""],
    )
    chunks = splitter.split_text(text)

    store = FAISS.from_texts(chunks, _embeddings)

    FAISS_DIR.mkdir(parents=True, exist_ok=True)
    store.save_local(str(FAISS_DIR))
    HASH_FILE.write_text(_cv_hash(), encoding="utf-8")

    logger.info("FAISS index built and saved (%d chunks).", len(chunks))
    return store


def _load_or_build() -> FAISS:
    current_hash = _cv_hash()

    if (
        FAISS_DIR.exists()
        and HASH_FILE.exists()
        and HASH_FILE.read_text(encoding="utf-8").strip() == current_hash
    ):
        try:
            store = FAISS.load_local(
                str(FAISS_DIR),
                _embeddings,
                allow_dangerous_deserialization=True,
            )
            logger.info("Loaded FAISS index from cache.")
            return store
        except Exception as exc:
            logger.warning("Cache load failed (%s); rebuilding.", exc)

    return _build_and_cache()


def build_retriever():
    """Call once at startup to warm up the retriever."""
    global _retriever
    if _retriever is None:
        store = _load_or_build()
        _retriever = store.as_retriever(
            search_type="similarity",
            search_kwargs={"k": 4},
        )


def get_retriever():
    if _retriever is None:
        build_retriever()
    return _retriever
