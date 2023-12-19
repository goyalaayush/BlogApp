const express= require('express');
const cors=require('cors');
const app=express();
const jwt=require('jsonwebtoken');
const mongoose = require('mongoose');
const User=require('./models/User');
const Post=require('./models/Post');
const  ObjectID = require('mongodb').ObjectId;
const multer  = require('multer')
const uploadMiddleware = multer({ dest: 'uploads/' })
const bcrypt = require('bcrypt');
const fs=require('fs');
const cookieParser = require('cookie-parser');
const saltRounds=10;
const salt = bcrypt.genSaltSync(saltRounds);
const secret='dfjdfdkjnfdnfkjfdnfvdkjn'
 mongoose.connect('mongodb+srv://blog:0igK4H7LHlgHPTvy@cluster0.07ogioi.mongodb.net/');
app.use(cors({credentials:true,origin:'http://localhost:3000'}));
app.use(express.json());
app.use(cookieParser());
app.use('/uploads',express.static(__dirname+'/uploads'));

app.listen(4000);



app.post('/register',async(req,res)=>{
    const {username,password}=req.body;

try{
    
    const userdoc=await User.create({username,
        password:bcrypt.hashSync(password, salt)
    
    })

    res.json(userdoc);
} catch(e){
 res.status(400).json(e)
}
})

app.post('/login',async (req,res)=>{

    const {username,password}=req.body;

    const userdoc=await User.findOne({username})
    if(!userdoc)  res.status(400).json('wrong credentials')
    const passok= bcrypt.compareSync(password, userdoc.password);
 if(passok)
 {
  jwt.sign({username,id:userdoc._id},secret,{},(err,token)=>{
    if(err)throw err;
    else
    res.cookie('token',token).json({
    id:userdoc._id,
    username
    });
  })
 }
 else 
 {
    res.status(400).json('wrong credentials')
 }

})


app.get('/profile',(req,res)=>{

    const {token}=req.cookies;
    jwt.verify(token,secret,{},(err,info)=>{

if(err)  throw err;

        res.json(info);
    })
 

})
app.post('/logout',(req,res)=>{
 
    res.cookie('token','').json('ok');


})

app.post('/post',uploadMiddleware.single('file'),async(req,res)=>{
   
   const {originalname,path}=req.file;
   const parts=originalname.split('.');
   const ext=parts[parts.length-1];
   const newPath=path+'.'+ext;
  fs.renameSync(path,newPath);
 

  const {token}=req.cookies;
  jwt.verify(token,secret,{},async(err,info)=>{

    if(err)  throw err;

    const {title,summary,content}=req.body;
    const postDoc=   await Post.create({
   
        title,
        summary,
        content,
        cover:newPath,
        author:info.id,
           })
        
            res.json(postDoc);
     
        })
     



})


app.get('/post',async(req,res)=>{

    res.json(await Post.find().populate('author'));

})


app.get('/post/:id',async(req,res)=>{

    
    const {id}=req.params;
    const postDoc=await Post.findById(id).populate('author',['username']);
    res.json(postDoc);

})


app.put('/post',uploadMiddleware.single('file'),async(req,res)=>{
  
    let newPath=null;
    if(req.file)
    {
        const {originalname,path}=req.file;
        const parts=originalname.split('.');
        const ext=parts[parts.length-1];
    newPath=path+'.'+ext;
    fs.renameSync(path,newPath);
    }
  const {token}=req.cookies;

 jwt.verify(token,secret,{},async(err,info)=>{

    if(err)  throw err;
    const {title,summary,content,id}=req.body;

    
    const postDoc=await Post.findById(id);
 const isAuthor=JSON.stringify(postDoc.author)===JSON.stringify(info.id);

 if(!isAuthor)
 {
    return res.status(400).json('You are not the Author')
 
 }
 await postDoc.updateOne({

    title,summary,content,
    cover:newPath?newPath:postDoc.cover,

 });

 res.json(postDoc);
   
 })

})

app.delete('/delete/:id',async(req,res)=>{
  
    
 
    const id=req.params;
  
  const resp=await Post.findOneAndDelete({_id:new ObjectID(id)});
   res.json('ok');
   

})









//mongodb+srv://blog:0igK4H7LHlgHPTvy@cluster0.07ogioi.mongodb.net/

//0igK4H7LHlgHPTvy