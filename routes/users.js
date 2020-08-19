const express=require('express')
const router= express.Router();
const mongoose=require('mongoose')
const User=require('../models/user')

const bcrypt= require ('bcrypt')
const jwt = require("jsonwebtoken");
const asyncHandler = require('express-async-handler')


router.post('/register', asyncHandler(async(req,res,next) => {

  try
  {
    const user = await User.find({email: req.body.email});
    if(user.length>=1)
    {
      throw new Error("Email id already exists");

    }
    else
    {
      var encryptedPassword= await bcrypt.hash(req.body.password, 10);
      
        const user = new User({
          _id: new mongoose.Types.ObjectId(),
          email : req.body.email,
          password: encryptedPassword

      })
       user.save();
       res.status(200).json({ message: "User created"});
    }
  }
  catch(err)
  {
      res.status(500).json({error: err.message});

  }
}))


router.post("/login", asyncHandler(async(req, res, next) => {

  try
  {
  const user = await User.find({ email: req.body.email });

  if(user.length<1)
  {
    return res.status(401).json({
      message: "Not a registered user",
      registerationLink:"/user/register"
    });

  }

  var validPassword= await bcrypt.compare(req.body.password, user[0].password);
  if(!validPassword)
  {
    throw new Error("Invalid Password");

  }
  else
  {
    const token = jwt.sign(
      {
        email: user[0].email,
        userId: user[0]._id
      },
      process.env.JWT_KEY,
      {
          expiresIn: "1h"
      }
    );
    return res.status(200).json({
      message: "Auth successful",
      token: token
    });
  }}
  catch(err)
  {
    res.status(500).json({error: err.message});

  }
  
}));

module.exports=router;