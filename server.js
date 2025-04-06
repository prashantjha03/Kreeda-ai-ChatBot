const express = require("express");
const cors = require("cors"); // Add this line
const {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} = require("@google/generative-ai");

const app = express();
const port = 3000;

// Enable CORS for all routes
app.use(cors()); // Add this line

// Middleware to parse JSON requests
app.use(express.json());

app.use(express.static("public"));


const apiKey = "AIzaSyCvn9SG3QphhNdUwo-FscWepVKhmhnWgSo";
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

// Serve the index.html file
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

// Handle chat POST requests
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
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
