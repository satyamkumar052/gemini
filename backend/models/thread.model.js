import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema({
    role : {
        type : String,
        enum : ["user", "assistent"],
        required : true
    },
    content : {
        type : String,
        required : true
    },
    timeStamp : {
        type : Date,
        default : Date.now
    }
});


const ThreadSchema = new mongoose.Schema({
    threadId : {
        type : String,
        required : true,
        unique : true
    },
    title :{
        type : String,
        default : "New Chat"
    },
    messages : [MessageSchema],
    createdAt : {
        type : Date,
        default : Date.now
    },
    updatedAt : {
        type : Date,
        default : Date.now
    },
    prompts: {
        type: Number,
        default: 0,
    },
    totalTokensUsed: {
        type: Number,
        default: 0,
    }
});


export default mongoose.model("Thread", ThreadSchema);
