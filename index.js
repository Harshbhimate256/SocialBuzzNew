const express = require('express')
const app = express();
var expressSession = require('express-session')
var passport = require('passport')
var flash = require('connect-flash');
var usersRouter = require('./routes/user')
const path = require('path');
const mongoose = require('mongoose');
const userModel = require('./routes/user');
const postModel = require('./routes/post');
const upload = require('./routes/multer');
const moment = require('moment');
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
const localStrategy = require('passport-local');
passport.use(new localStrategy(userModel.authenticate()));
app.use(express.static(path.join(__dirname, 'public'))); //do not need to write /public while linking any file from public

require('dotenv').config(
    { path: path.join(__dirname, '.env') }
);
app.use(expressSession({
    resave:false,
    saveUninitialized:false,
    secret: 'heyhey'
  }));
  app.use(passport.initialize());
  app.use(passport.session());
  passport.serializeUser(usersRouter.serializeUser())
  passport.deserializeUser(usersRouter.deserializeUser());
  app.use(flash());
//set view engine 
app.set("view engine", "ejs");

//------------------------------routes-----------------------------------------
app.get('/loginHere', (req,res)=>{
    res.render("login", {error:req.flash('error')});
});
app.get('/', (req,res)=>{
    res.render("register");
});
app.get('/profile', isLoggedIn,async (req,res)=>{
    const user = await userModel.findOne({
    username:req.session.passport.user
  }).populate('posts');
    res.render('profile',{user});
});
app.get('/feed', isLoggedIn , async function(req,res){
  const user = await userModel.findOne({username:req.session.passport.user});
  const posts = await postModel.find().populate("user");
  res.render('feed',{posts,user,moment});
})
app.get("/upload",isLoggedIn,function(req,res,next){
  res.render('upload');
})
app.post('/upload',upload.single('upload-img'),async (req,res)=>{
  if(!req.file){
    return res.status(404).send('no file uploaded');
  }
  const user = await userModel.findOne({username:req.session.passport.user});
  const post = await postModel.create({
    image: req.file.filename,
    postCaption:req.body.caption,
    user:user._id
  });
  user.posts.push(post._id);
  await user.save();
  res.redirect('/feed')
});
app.get('/search',isLoggedIn, function(req,res){
  res.render('search');
})
//for searching
app.get('/username/:username',isLoggedIn, async function(req,res){
  const regex = new RegExp(`^${req.params.username}` , 'i');
  const users = await userModel.find({username: regex});
  res.json(users)
});

app.get("/editprofile",isLoggedIn,async function(req,res,next){
  const user = await userModel.findOne({username:req.session.passport.user});
  res.render('editprofile',{user}); 
})
app.post('/updateDetails',isLoggedIn,upload.single('profileUpload'), async function(req,res){
  const user = await userModel.findOneAndUpdate({username:req.session.passport.user},
    {name:req.body.fullname , username:req.body.username, email:req.body.email, role:req.body.role, bio:req.body.bio},
    {new:true}
  );
  if(req.file){
    user.profileImage = req.file.filename;
  }
  await user.save();
  res.redirect('/profile');
})

app.get('/like/post/:id',isLoggedIn,async function(req,res){
  const user = await userModel.findOne({username:req.session.passport.user});
  const post  = await postModel.findOne({_id: req.params.id});

  //if not liked the post then like it
  if(post.likes.indexOf(user._id) === -1){
    post.likes.push(user._id);
  }
  else{
    post.likes.splice(post.likes.indexOf(user._id) , 1);
  }

  await post.save();
  res.redirect('/feed');
})
app.post('/comment/post/:id',isLoggedIn,async function(req,res){
  const user = await userModel.findOne({username:req.session.passport.user});
  const post  = await postModel.findOne({_id: req.params.id});
  const newComment = {
    text:req.body.comment,
    user:user._id,
  };
  if(!newComment.text){
    req.flash('error',"Please enter a comment");
    return res.redirect('/feed')
  }
  post.comments.push(newComment)
  await post.save();

  res.redirect('/feed');
})

app.get('/commentSection/:id',isLoggedIn, async function(req,res){
    const user = await userModel.findOne({username: req.session.passport.user});
    const post = await postModel.findOne({_id:req.params.id}).populate({
      path:'comments',
      populate:{path:'user',select:'username profileImage'}
    });
    res.render('commentSection',{post,user});
})
app.get('/comment/delete/:id/:commentId',isLoggedIn,async function(req,res){
  try{
    const postId = req.params.id;
    const commentId = req.params.commentId;
    await postModel.findOneAndUpdate(
      {_id:postId},
      {$pull:{comments:{_id:commentId}}}
    );
    res.redirect(`/commentSection/${postId}`);
    
  }catch(err){
    console.error(err);
    res.status(500).send({message:'error deleting the comment'})
  }
})

app.get('/post/delete/:id',isLoggedIn,async function(req,res){
  try{
    const postId = req.params.id;
    await postModel.findOneAndDelete({_id:postId});
    res.redirect('/profile')
  }catch(err){
    res.status(500).send({message:'error while deleting post'})
  }
})
//------------authentication-----------------------
app.post('/register',async  function(req,res,next){
    const userData = new userModel({
        username: req.body.username,
      name: req.body.name,
      email: req.body.email,
    });
    userModel.register(userData,req.body.password)
    .then(function(){
      passport.authenticate('local')(req,res,function(){
        res.redirect('/profile');
      })
    })
  });
  app.post('/login', passport.authenticate('local',{
    successRedirect: '/feed',
    failureRedirect: '/loginHere',
    failureFlash:true,
  }),function(req,res){})
  
  app.get('/logout',function(req,res,next){
    req.logout(function(err){
      if(err) return next(err);
      res.redirect('/loginHere')
    })
  })
  function isLoggedIn(req,res,next){
    if(req.isAuthenticated()){
      return next();
    }
    res.redirect('/loginHere')
  }
  //------------authentication-----------------------



//CONNECTION PART
const port = process.env.PORT ||  3000;
// app.listen(PORT);
mongoose.set('strictQuery',false);
const connectDB = async ()=>{
  try{
    const conn = await mongoose.connect(process.env.MONGO_DB_URI);
    console.log(`mongoDB connected: ${conn.connection.host}`);
  }catch(error){
    console.log(error);
    process.exit(1);
  }
}
connectDB().then(()=>{
  app.listen(port, ()=>{

    
    console.log(`listening on port ${port}`);
  })
});