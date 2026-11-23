/* Data and fetchers for the terminal's fun commands. */

/* ── joke ─────────────────────────────────────────────────────────── */
export const JOKES = [
  ["Why do programmers prefer dark mode?", "Because light attracts bugs."],
  ["How many programmers does it take to change a light bulb?", "None. That's a hardware problem."],
  ["Why did the developer go broke?", "Because they used up all their cache."],
  ["Why did the React component feel lonely?", "Nobody passed it any props."],
  ["Why do Java developers wear glasses?", "Because they don't C#."],
  ["A SQL query walks into a bar, approaches two tables and asks…", "\"Can I join you?\""],
  ["Why was the JavaScript developer sad?", "Because they didn't Node how to Express themselves."],
  ["What did the router say to the doctor?", "\"It hurts when IP.\""],
  ["Why did the function stop calling?", "It had too many arguments."],
  ["How do you comfort a JavaScript bug?", "You console it."],
  ["Why don't LLMs ever get lost?", "They always follow the most probable path."],
  ["What's the object-oriented way to become wealthy?", "Inheritance."],
  ["Why did the CSS developer break up?", "They felt boxed in, and nothing would align."],
  ["What do you call 8 hobbits?", "A hobbyte."],
  ["Why was the GPS bad at relationships?", "It kept recalculating."],
  ["Why did the geospatial dev get promoted?", "They really knew how to map out their career."],
  ["What's a vector database's favourite pickup line?", "\"I feel like we're really close in embedding space.\""],
  ["Why do Python programmers have low self-esteem?", "They're constantly comparing self to other."],
  ["There are 10 kinds of people in the world.", "Those who understand binary and those who don't."],
  ["Why did the developer quit their job?", "They didn't get arrays."],
  ["What's a FastAPI developer's favourite exercise?", "Async-ups."],
  ["I would tell you a UDP joke…", "…but you might not get it."],
  ["Knock knock. Race condition.", "Who's there?"],
  ["Why was the commit message so calm?", "It had already been through a lot of rebase-ing."],
];

let jokeBag = [];
/** A random joke, without repeats until the whole list has been told. */
export function nextJoke() {
  if (!jokeBag.length) jokeBag = JOKES.map((_, i) => i).sort(() => Math.random() - 0.5);
  return JOKES[jokeBag.pop()];
}

/* ── weather (Open-Meteo: free, no key, CORS-enabled) ──────────────── */
const HOME = { name: "Yamunanagar", admin1: "Haryana", country: "India", latitude: 30.128, longitude: 77.284 };

// WMO weather codes → label + icon kind.
const CODES = [
  [[0], "Clear sky", "clear"],
  [[1], "Mainly clear", "partly"],
  [[2], "Partly cloudy", "partly"],
  [[3], "Overcast", "cloud"],
  [[45, 48], "Fog", "fog"],
  [[51, 53, 55, 56, 57], "Drizzle", "rain"],
  [[61, 63, 65, 66, 67], "Rain", "rain"],
  [[71, 73, 75, 77], "Snow", "snow"],
  [[80, 81, 82], "Rain showers", "rain"],
  [[85, 86], "Snow showers", "snow"],
  [[95, 96, 99], "Thunderstorm", "storm"],
];

export const WEATHER_ART = {
  clear: ["    \\   /    ", "     .-.     ", "  ― (   ) ―  ", "     `-'     ", "    /   \\    "],
  night: ["      _..    ", "    .' .'    ", "   :  :      ", "    '. '.    ", "      `''    "],
  partly: ["   \\  /      ", " _ /\"\".-.    ", "   \\_(   ).  ", "   /(___(__) ", "             "],
  cloud: ["             ", "     .--.    ", "  .-(    ).  ", " (___.__)__) ", "             "],
  fog: ["             ", " _ - _ - _ - ", "  _ - _ - _  ", " _ - _ - _ - ", "             "],
  rain: ["     .-.     ", "    (   ).   ", "   (___(__)  ", "    ‚ʻ‚ʻ‚ʻ‚ʻ  ", "    ‚ʻ‚ʻ‚ʻ‚ʻ  "],
  snow: ["     .-.     ", "    (   ).   ", "   (___(__)  ", "    *  *  *  ", "   *  *  *   "],
  storm: ["     .-.     ", "    (   ).   ", "   (___(__)  ", "    ⚡ʻ‚⚡ʻ‚  ", "    ‚ʻ‚ʻ‚ʻ   "],
};

async function getJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(String(res.status));
  return res.json();
}

/** Current weather for a city name (or Prabhjot's home town). */
export async function fetchWeather(query) {
  let place = HOME;
  if (query) {
    const geo = await getJSON(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=1&language=en`
    );
    if (!geo.results?.length) return { notFound: true };
    place = geo.results[0];
  }
  const w = await getJSON(
    `https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}&longitude=${place.longitude}` +
      "&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,is_day&timezone=auto"
  );
  const c = w.current;
  const [, label, kind] = CODES.find(([codes]) => codes.includes(c.weather_code)) || [null, "Unknown", "cloud"];
  // Local time at the place: UTC now + the place's offset.
  const local = new Date(Date.now() + w.utc_offset_seconds * 1000);
  const hh = String(local.getUTCHours()).padStart(2, "0");
  const mm = String(local.getUTCMinutes()).padStart(2, "0");
  return {
    place: [place.name, place.admin1, place.country].filter(Boolean).join(", "),
    home: !query,
    temp: Math.round(c.temperature_2m),
    feels: Math.round(c.apparent_temperature),
    humidity: c.relative_humidity_2m,
    wind: Math.round(c.wind_speed_10m),
    label,
    art: WEATHER_ART[kind === "clear" && !c.is_day ? "night" : kind],
    time: `${hh}:${mm}`,
  };
}
