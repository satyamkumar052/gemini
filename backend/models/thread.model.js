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
<<<<<<< HEAD
=======
    image: {
        data: {
            type : String,
            default: null
        },
        mimeType: {
            type: String,
            default: null,
        }
    },
>>>>>>> origin/main
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
<<<<<<< HEAD
=======
    userId: {
        type : mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null
    },
>>>>>>> origin/main
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
<<<<<<< HEAD
=======
    },
    prompts: {
        type: Number,
        default: 0,
    },
    totalTokensUsed: {
        type: Number,
        default: 0,
>>>>>>> origin/main
    }
});


export default mongoose.model("Thread", ThreadSchema);
