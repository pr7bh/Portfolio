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
  Overhead: {
    kind: "Live aircraft & weather map",
    overview:
      "What plane is that? Overhead shows real aircraft around you or any city, points to the closest one with a compass direction and angle above the horizon, and draws live wind, rain, snow and cloud forecasts on the same map.",
    built: [
      "Live MapLibre map with planes coloured by altitude, a nearest-first list, search and filters, a closest-plane compass and nearby alerts.",
      "Dependency-free Node server with a shared cache that polls only while a tab is visible, respects each source's limits and backs off when one fails.",
      "Hand-written GRIB2 decoder that reads NOAA GFS forecast files, with every length checked before use.",
      "Animated wind lines on a custom canvas layer, from ground level up to 39,000 ft.",
      "Privacy by design: location rounded to about 1 km before it leaves the page, city search in the browser and a strict content security policy.",
      "89 automated tests for parsing, maths, request limits and the server, none of which call a live API.",
    ],
    flow: ["adsb.lol & NOAA GFS", "Node server: cache & limits", "Parsing & GRIB2 decoding", "MapLibre + canvas layers", "Live map, compass & alerts"],
    stack: ["JavaScript (ES modules)", "Node.js", "MapLibre GL", "Canvas", "NOAA GFS / GRIB2", "Vercel Functions"],
    credits: [
      { label: "adsb.lol (ODbL)", url: "https://www.adsb.lol/docs/open-data/api/" },
      { label: "NOAA GFS", url: "https://registry.opendata.aws/noaa-gfs-bdp-pds/" },
      { label: "OpenFreeMap", url: "https://openfreemap.org/" },
      { label: "OpenMapTiles", url: "https://www.openmaptiles.org/" },
      { label: "OpenStreetMap", url: "https://www.openstreetmap.org/copyright" },
    ],
  },
  "Real Estate": {
    kind: "Full-stack property marketplace",
    overview:
      "A MERN marketplace where people list homes to rent or sell, and buyers search, filter and contact the owner directly. Signed-in users manage their own listings and profile.",
    built: [
      "Express + MongoDB REST API for listings and users, with create, update and delete protected by JWT (httpOnly cookie) auth.",
      "Email sign-up with bcrypt-hashed passwords, plus one-click Google sign-in through Firebase Auth.",
      "Search with filters for rent / sale, offers, parking and furnished, plus sorting and \"show more\" pagination.",
      "Listing editor with multi-image uploads to Firebase Storage; listing pages with a Swiper gallery, share link and a pre-filled email to the landlord.",
      "React front end with Redux Toolkit (persisted session) and private routes for profile and listing management.",
    ],
    flow: ["React + Redux Toolkit", "Express API (JWT auth)", "MongoDB", "Firebase Auth & Storage"],
    stack: ["React", "Redux Toolkit", "React Router", "Node.js", "Express", "MongoDB", "JWT", "Firebase", "Swiper"],
    repo: "https://github.com/pr7bh/real-estate",
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
