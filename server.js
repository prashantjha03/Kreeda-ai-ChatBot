const express = require("express");
const cors = require("cors");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();

// Define allowed origins (your Vercel frontend URLs)
const allowedOrigins = [
  "https://kreeda-ai-chat-bot-frontend.vercel.app",
  "https://kreeda-ai-chat-bot-f-git-7c6e8b-prashant-jhas-projects-1e280b00.vercel.app",
  "http://localhost:3000", // Optional: for local testing
];

// Configure CORS
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like Postman) or from allowed origins
      if (!origin || allowedOrigins.includes(origin)) {
        console.log(`Origin allowed: ${origin}`); // Debug log
        callback(null, true);
      } else {
        console.log(`Origin blocked: ${origin}`); // Debug log
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "OPTIONS"], // Include OPTIONS explicitly
    allowedHeaders: ["Content-Type", "Authorization"], // Add Authorization
  })
);

// Middleware to parse JSON requests
app.use(express.json());

// Test endpoint to verify CORS and server status
app.get("/api", (req, res) => {
  res.json({ message: "CORS is working!" });
});

// Google Generative AI setup
const apiKey = "AIzaSyCvn9SG3QphhNdUwo-FscWepVKhmhnWgSo"; // Hardcoded API key

if (!apiKey) {
  console.error("Google API key is missing.");
  process.exit(1); // Exit if no API key
}

const genAI = new GoogleGenerativeAI(apiKey);

// const model = genAI.getGenerativeModel({
//   model: "gemini-2.5-pro-exp-03-25",
//   systemInstruction:
//     "You are a Sports AI chatbot where users can ask you anything related to sports, whether it's scores of cricket matches, upcoming games, or game suggestions. Answer all sports-related queries accurately and helpfully.",
// });

const model = genAI.getGenerativeModel({
  model: "gemini-2.5-pro-exp-03-25",
  systemInstruction:
    "You are a Sports AI chatbot. Respond only to questions and queries related to sports. You should not respond to anything outside of sports-related topics such as movies, technology, or personal matters. If a question is not related to sports, reply with something like 'I only answer sports-related questions, please ask about a sport!'.",
});


const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 64,
  maxOutputTokens: 65536,
  responseMimeType: "text/plain",
};

// Start chat session once when the server starts
const chatSession = model.startChat({
  generationConfig,
  history: [
    {
      role: "user",
      parts: [{ text: "hi" }],
    },
    {
      role: "model",
      parts: [
        {
          text: "Hello there! 👋\n\nHow can I help you with the world of sports today? Whether you need the latest scores, want to know about upcoming matches, need a game suggestion, or have any other sports question, just ask away! ⚽🏏🏀🏈🎾",
        },
      ],
    },
  ],
});

// Chat route
app.post("/chat", async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ response: "Message is required" });
  }

  try {
    const result = await chatSession.sendMessage(message);
    const aiResponse = result.response.text();
    res.json({ response: aiResponse });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ response: "Sorry, something went wrong!" });
  }
});

// Root route
app.get("/", (req, res) => {
  res.json({ message: "Server is running, use /chat to interact with the AI." });
});

// Start the server
const PORT = process.env.PORT || 10000; // Use 10000 to match Render config
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server running on port ${PORT}`);
});
