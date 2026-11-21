/* Case-study details for each project, keyed by title. Written from the CV
   and the public repositories; keep claims to what the code shows.
   `flow` is the architecture diagram, left to right. */

export const CASE_STUDIES = {
  "GeoMind AI": {
    kind: "Agentic GIS platform",
    overview:
      "GIS analysis usually needs specialist tools and know-how. GeoMind lets anyone ask a geographic question in plain English and turns it into a structured research workflow, with the evidence laid out on a map.",
    built: [
      "Agentic pipeline that converts natural-language questions into geospatial research workflows.",
      "FastAPI spatial-analysis engine: feature discovery, proximity analysis, service coverage, comparative analysis and site suitability.",
      "LLM tool orchestration with evidence-based research synthesis, plus automatic PDF / DOCX report generation.",
      "Interactive React + OpenLayers map with research sessions and map-based analytical workflows.",
    ],
    flow: ["Question in plain English", "LLM agent plans the analysis", "FastAPI spatial engine", "GeoPandas · Shapely · OpenStreetMap", "Map, findings & report"],
    stack: ["React.js", "OpenLayers", "Python", "FastAPI", "GeoPandas", "Shapely", "LLMs"],
    repo: "https://github.com/pr7bh/GeoMind-AI",
  },
  Syncora: {
    kind: "GenAI meeting assistant",
    overview:
      "Recordings and long videos are hard to search later. Syncora transcribes audio, video and YouTube links, summarises them and lets you ask follow-up questions about what was said.",
    built: [
      "FastAPI services for transcription, summarisation and Q&A, using Whisper and Google Gemini.",
      "Retrieval-augmented generation with vector search over transcripts, so answers stay grounded in the recording.",
      "Follow-up questions with chat history, in a React front end.",
    ],
    flow: ["Upload or YouTube link", "Whisper transcription", "Gemini summary", "Vector search (RAG)", "Chat with history"],
    stack: ["React.js", "Python", "FastAPI", "Whisper", "Gemini", "RAG"],
    repos: [
      { label: "Frontend", url: "https://github.com/pr7bh/syncora-frontend" },
      { label: "Backend", url: "https://github.com/pr7bh/syncora-backend" },
    ],
  },
  "Real Estate": {
    kind: "Property discovery",
    overview: "A property discovery and search platform for browsing listings. Open the live site to explore it.",
    built: [],
    flow: [],
    stack: [],
  },
  "Netflix Clone": {
    kind: "Full-stack streaming catalogue",
    overview:
      "A full-stack take on a streaming service: create an account, browse movies and TV, search the catalogue and watch trailers.",
    built: [
      "Express REST API with auth, movie, TV, search and user routes, backed by MongoDB (Mongoose).",
      "JWT authentication in cookies with bcrypt-hashed passwords.",
      "A TMDB service layer for catalogue data, behind Helmet and rate limiting.",
      "React front end with Zustand state and trailer playback.",
    ],
    flow: ["React + Zustand", "Express API (JWT)", "MongoDB", "TMDB API"],
    stack: ["React", "Zustand", "Node.js", "Express", "MongoDB", "JWT", "TMDB API"],
    repo: "https://github.com/pr7bh/netflix-clone",
  },
  Cryptoverse: {
    kind: "Live crypto tracker",
    overview: "A cryptocurrency tracker with live market data and price-history charts.",
    built: [
      "Market data from the CoinGecko API, routed through a Vercel serverless proxy.",
      "Interactive price-history charts with Chart.js.",
      "Multi-page React app (React Router) built with Material UI.",
      "Smooth scrolling and motion with Lenis, GSAP and Three.js.",
    ],
    flow: ["React UI", "Vercel serverless proxy", "CoinGecko API", "Chart.js charts"],
    stack: ["React", "React Router", "Material UI", "Chart.js", "Vercel Functions", "GSAP"],
    repo: "https://github.com/pr7bh/cryptoverse",
  },
  "Shopping Cart": {
    kind: "E-commerce storefront",
    overview: "A modern e-commerce storefront built with Next.js and TypeScript.",
    built: [
      "Next.js App Router and TypeScript front end.",
      "Supabase as the backend.",
      "Cart state with Zustand; forms validated with React Hook Form and Zod.",
      "3D and motion with React Three Fiber, GSAP and Lenis.",
    ],
    flow: ["Next.js (TypeScript)", "Zustand cart", "Supabase"],
    stack: ["Next.js", "TypeScript", "Supabase", "Zustand", "Zod", "Three.js", "GSAP"],
    repo: "https://github.com/pr7bh/shopco-ecommerce",
  },
};
