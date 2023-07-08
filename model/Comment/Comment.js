const mongoose = require("mongoose");

//Schema
const commentSchema = new mongoose.Schema({
    message:{
        type:String,
        required:true,
    },
    author:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:"User",
    },

    postId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Post",
        required:true,
    }
},{
    timestamps:true
});

//compile schema to model
const Comment = mongoose.model("Commment", commentSchema);
module.exports = Comment