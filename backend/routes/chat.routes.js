import express from "express";
import Thread from "../models/thread.model.js";
import getGeminiResponse from "../utils/gemini.js";
import { optionalAuth } from "../middlewares/auth.middleware.js";

const router = express.Router();

// get all threads
router.get("/thread", optionalAuth, async (req, res) => {
  try {

    if(!req.user) {
      return res.json([]);
    }

    const threads = await Thread.find({ userId : req.user.id})
      .select("-_id threadId title prompts totalTokensUsed")
      .sort({ updatedAt: -1 });

    res.json(threads);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to fetch threads" });
  }
});

router.get("/thread/:threadId", optionalAuth, async (req, res) => {
  const { threadId } = req.params;

  try {
    const thread = await Thread.findOne({ threadId: threadId });

    if (!thread) return res.status(404).json({ message: "Thread not found" });

    if(thread.userId && (!req.user || req.user.id !== thread.userId.toString())) {
      return res.status(403).json({ message: "Access denied"});
    }

    res.json({
      messages: thread.messages,
      totalTokensUsed: thread.totalTokensUsed || 0,
      prompts: thread.prompts || thread.messages.filter(m => m.role === "user").length,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to fetch chat" });
  }
});

router.delete("/thread/:threadId", optionalAuth, async (req, res) => {
  const { threadId } = req.params;

  try {
    const thread = await Thread.findOne({ threadId });

    if (!thread) {
      return res.status(404).json({ message: "Thread not found" });
    }

    if (thread.userId && (!req.user || req.user.id !== thread.userId.toString())) {
      return res.status(403).json({ message: "Access denied" });
    }

    await Thread.deleteOne({ threadId });

    res.status(200).json({ success: "Thread deleted successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to delete thread" });
  }
});

router.post("/chat", optionalAuth, async (req, res) => {
  const { threadId, message, model, image } = req.body;

  if (!threadId || !message) {
    return res.status(400).json({ message: "missing required fields" });
  }

  const isGuest = !req.user;
  const maxLimit = isGuest ? 5 : 10;

  const lockedModels = ["gemini-4-argon", "gemini-nano-banana-2.1", "gemini-3.8-flash"];
  if (lockedModels.includes(model) && isGuest) {
    return res.status(403).json({ message: "This model is only available for signed-in users. Please sign in." });
  }

  try {
    let thread = await Thread.findOne({ threadId });

    const userMessageObj = {
      role: "user",
      content: message,
      image: image && image.data ? {
        data: image.data,
        mimeType: image.mimeType || "image/png"
      } : null,
    };

    if (!thread) {
      thread = new Thread({
        threadId,
        userId: req.user ? req.user.id : null,
        title: message,
        messages: [userMessageObj],
        prompts: 1,
      });
    } else {
      const currentPrompts = thread.prompts || thread.messages.filter(m => m.role === "user").length;
      if (currentPrompts >= maxLimit) {
        if(isGuest) {
          return res.status(403).json({ message: "Guest limit reached for this chat (maximum 5 prompts). Please sign in to continue." });
        } else {
          return res.status(403).json({ message: "Prompt limit reached for this chat (maximum 10 prompts). Please start a new chat." });
        }
      }
      
      if(!thread.userId && req.user) {
        thread.userId = req.user.id;
      }

      thread.messages.push(userMessageObj);
      thread.prompts = currentPrompts + 1;
    }

    //pass the entire message history for context

    const { text: assistentReply, totalTokenCount, image: generatedImage } = await getGeminiResponse(thread.messages, model, image);

    thread.messages.push({ role: "assistent", content: assistentReply, image: generatedImage });
    thread.totalTokensUsed = (thread.totalTokensUsed || 0) + (totalTokenCount || 0);

    thread.updatedAt = new Date();
    await thread.save();

    res.json({
      reply: assistentReply,
      totalTokensUsed: thread.totalTokensUsed,
      prompts: thread.prompts,
      image: generatedImage
    });
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

