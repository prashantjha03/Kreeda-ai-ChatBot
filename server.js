const express = require("express");
const cors = require("cors");
const path = require("path");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();

// Enable CORS with specific origins (add your Vercel URL)
const allowedOrigins = ["https://kreeda-ai-chat-bot-frontend.vercel.app/"];
app.use(
  cors({
    origin: allowedOrigins,
  })
);

// Middleware to parse JSON requests
app.use(express.json());

// Serve static files from "public" folder
app.use(express.static(path.join(__dirname, "public")));

// Directly insert the API key here
const apiKey = "AIzaSyCvn9SG3QphhNdUwo-FscWepVKhmhnWgSo";  // Keep your API key here

if (!apiKey) {
  console.error("Google API key is missing. Please make sure it's defined in the code.");
  process.exit(1);  // Exit the server if the key is not present
}

const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: "gemini-2.5-pro-exp-03-25",
  systemInstruction:
    "You are a Sports AI chatbot where users can ask you anything related to sports, whether it's scores of cricket matches, upcoming games, or game suggestions. Answer all sports-related queries accurately and helpfully.",
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

// Route for root URL
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Chat route
app.post("/chat", async (req, res) => {
  const { message } = req.body;

  try {
    const result = await chatSession.sendMessage(message);
    const aiResponse = result.response.text();
    res.json({ response: aiResponse });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ response: "Sorry, something went wrong!" });
  }
});

// Start the server
const PORT = process.env.PORT || 1000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
