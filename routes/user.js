const mongoose = require('mongoose');
// mongoose.connect('mongodb+srv://harshbhimate2018:uBT35hQsHZeESORJ@cluster1.zr04ipw.mongodb.net/?retryWrites=true&w=majority&appName=Cluster1');
const plm =require('passport-local-mongoose');

const userSchema =new mongoose.Schema({
  username: {
    type:String,
    require: true,  
  },
  name: String,
  email: {
    type:String,
    require: true,
  },
  bio:{
    type:String,
  },
  role:{
    type:String,
  },
  password:String,
  posts:[{
    type: mongoose.Schema.Types.ObjectId,
    ref:'post'
  }],
  profileImage:{
    type:String
  }

})

userSchema.plugin(plm);

module.exports = mongoose.model("User",userSchema);