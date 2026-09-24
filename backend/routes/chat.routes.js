import express from 'express';
import Thread from "../models/thread.model.js";
import getGeminiResponse from "../utils/gemini.js";

const router = express.Router();

router.post('/test', async (req, res) => {
    try {

        const thread = new Thread({
            threadId : "xyz",
            title : "Sample Thread2",
        });

        const response = await thread.save();
        res.send(response)

    } catch (err) {
        console.log(err);
        res.status(500).json({message:"Failed to save in DB"});
    }
});

// get all threads
router.get("/thread", async (req, res) => {
    try {

        const threads = await Thread.find({}).sort({updatedAt : -1});

        res.json(threads);
        
    } catch (err) {
        console.log(err);
        res.status(500).json({message:"Failed to fetch threads"});
    }
});


router.get("/thread/:threadId", async (req, res) => {

    const {threadId} = req.params;

    try {

        const thread = await Thread.findOne({ threadId : threadId });

        if(!thread) return res.status(404).json({message:"Thread not found"});

        res.json(thread.messages);
        
    } catch (err) {
        console.log(err);
        res.status(500).json({message:"Failed to fetch thread"});
    }

});


router.delete("/thread/:threadId", async (req, res) => {
    
    const {threadId} = req.params;

    try {

        const deletedThread = await Thread.findOneAndDelete({ threadId });

        if(!deletedThread) return res.status(404).json({message:"Thread not found"});

        res.status(200).json({success : "Thread deleted successfully"});

        
    } catch (err) {
        console.log(err);
        res.status(500).json({message:"Failed to delete thread"});
    }

});


router.post("/chat", async (req,res) => {

    const {threadId, message} = req.body;

    if(!threadId || !message) {
        return res.status(400).json({message : "missing required fields"});
    }
    
    try {

        let thread = await Thread.findOne({threadId});

        if(!thread) {
            thread = new Thread({
                threadId,
                title:message,
                messages : [{ role : "user", content : message }]
            });
        } else {
            thread.messages.push({ role : "user", content : message });
        }

        const assistentReply = await getGeminiResponse(message);

        thread.messages.push({ role : "assistent", content : assistentReply });

        thread.updatedAt = new Date();
        await thread.save();

        res.json({ reply : assistentReply });

        
    } catch (err) {
        console.log(err);
    }
})



export default router;
