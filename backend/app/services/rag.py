from pathlib import Path
import re

from app.services.embeddings import (
    create_embedding,
    cosine_similarity,
)


RESUME_PATH = (
    Path(__file__).resolve().parent.parent
    / "data"
    / "resume.txt"
)


class ResumeVectorStore:

    def __init__(self):
        self.chunks = []
        self.embeddings = []
        self.is_built = False

    def build(self):

        if self.is_built:
            return

        resume = RESUME_PATH.read_text(
            encoding="utf-8"
        )

        self.chunks = self._chunk_resume(resume)

        self.embeddings = [
            create_embedding(chunk["text"])
            for chunk in self.chunks
        ]

        self.is_built = True

    def _chunk_resume(self, text: str):

        chunks = []

        # Split CV into major sections
        sections = re.split(
            r"\n(?=(?:Summary|Technical Skills|Experience|Projects|Education)\n)",
            text.strip(),
        )

        for section in sections:

            section = section.strip()

            if not section:
                continue

            # --------------------------------
            # Experience
            # --------------------------------

            if section.startswith("Experience"):

                experience_parts = re.split(
                    r"\n(?=(?:Software Developer|Software Engineer|Freelance Full Stack Developer)\n)",
                    section,
                )

                for part in experience_parts:

                    part = part.strip()

                    if not part:
                        continue

                    if part == "Experience":
                        continue

                    title = part.split("\n")[0]

                    chunks.append({
                        "section": "Experience",
                        "title": title,
                        "text": part,
                    })

            # --------------------------------
            # Projects
            # --------------------------------

            elif section.startswith("Projects"):

                project_parts = re.split(
                    r"\n(?=(?:Syncora|WebGeo|Predicted BA Capacity Margin Map))",
                    section,
                )

                for part in project_parts:

                    part = part.strip()

                    if not part:
                        continue

                    if part == "Projects":
                        continue

                    title = part.split("\n")[0]

                    chunks.append({
                        "section": "Projects",
                        "title": title,
                        "text": part,
                    })

            # --------------------------------
            # Other sections
            # --------------------------------

            else:

                lines = section.split("\n")

                title = lines[0]

                chunks.append({
                    "section": title,
                    "title": title,
                    "text": section,
                })

        return chunks

    def search(
        self,
        question: str,
        top_k: int = 3,
    ):

        if not self.is_built:
            self.build()

        # Create embedding for user's question
        question_embedding = create_embedding(
            question
        )

        scored_chunks = []

        # Compare question with every CV chunk
        for chunk, embedding in zip(
            self.chunks,
            self.embeddings,
        ):

            similarity = cosine_similarity(
                question_embedding,
                embedding,
            )

            # Ignore weak matches
            if similarity >= 0.30:

                scored_chunks.append({
                    "similarity": similarity,
                    "section": chunk["section"],
                    "title": chunk["title"],
                    "text": chunk["text"],
                })

        # Highest similarity first
        scored_chunks.sort(
            key=lambda item: item["similarity"],
            reverse=True,
        )

        # Return only the best matches
        return scored_chunks[:top_k]


vector_store = ResumeVectorStore()