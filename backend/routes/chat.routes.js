import express from "express";
import Thread from "../models/thread.model.js";
import getGeminiResponse from "../utils/gemini.js";

const router = express.Router();

router.post("/test", async (req, res) => {
  try {
    const thread = new Thread({
      threadId: "xyz",
      title: "Sample Thread2",
    });

    const response = await thread.save();
    res.send(response);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to save in DB" });
  }
});

// get all threads
router.get("/thread", async (req, res) => {
  try {
    const threads = await Thread.find({})
      .select("-_id threadId title")
      .sort({ updatedAt: -1 });

    res.json(threads);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to fetch threads" });
  }
});

router.get("/thread/:threadId", async (req, res) => {
  const { threadId } = req.params;

  try {
    const thread = await Thread.findOne({ threadId: threadId });

    if (!thread) return res.status(404).json({ message: "Thread not found" });

    res.json({
      messages: thread.messages,
      totalTokensUsed: thread.totalTokensUsed || 0,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to fetch chat" });
  }
});

router.delete("/thread/:threadId", async (req, res) => {
  const { threadId } = req.params;

  try {
    const deletedThread = await Thread.findOneAndDelete({ threadId });

    if (!deletedThread)
      return res.status(404).json({ message: "Thread not found" });

    res.status(200).json({ success: "Thread deleted successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to delete thread" });
  }
});

router.post("/chat", async (req, res) => {
  const { threadId, message } = req.body;

  if (!threadId || !message) {
    return res.status(400).json({ message: "missing required fields" });
  }

  try {
    let thread = await Thread.findOne({ threadId });

    if (!thread) {
      thread = new Thread({
        threadId,
        title: message,
        messages: [{ role: "user", content: message }],
      });
    } else {
      const userPromptCount = thread.messages.filter(m => m.role === "user").length;
      if (userPromptCount >= 10) {
        return res.status(403).json({ message: "Prompt limit reached for this chat (maximum 10 prompts). Please start a new chat." });
      }
      thread.messages.push({ role: "user", content: message });
    }

    //pass the entire message history for context

    const { text: assistentReply, totalTokenCount } = await getGeminiResponse(thread.messages);

    thread.messages.push({ role: "assistent", content: assistentReply });
    thread.totalTokensUsed = (thread.totalTokensUsed || 0) + (totalTokenCount || 0);

    thread.updatedAt = new Date();
    await thread.save();

    res.json({ reply: assistentReply, totalTokensUsed: thread.totalTokensUsed });
  } catch (err) {
    console.log(err);
    let errorMessage = err.message || "Failed to generate response";
    try {
      const parsed = JSON.parse(err.message);
      if (parsed.error?.message) {
        errorMessage = parsed.error.message;
      }
    } catch (e) {
      // already plain text
    }
    res.status(500).json({ message: errorMessage });
  }
});

export default router;
