const { text } = require('express');
const mongoose = require('mongoose');
// mongoose.connect('mongodb+srv://harshbhimate2018:uBT35hQsHZeESORJ@cluster1.zr04ipw.mongodb.net/?retryWrites=true&w=majority&appName=Cluster1');
const postSchema =new mongoose.Schema({
    postCaption:{
      type:String,
      require: true
    },
    image:{
      type:String,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    likes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      
    }],
    comments: [{
      text:String,
      user:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'User'
      },
      commentedAt:{
        type:Date,
        default:Date.now
      }
    }],
    createdAt: {
      type: Date,
      default: Date.now
    },
  })


module.exports = mongoose.model("post",postSchema);