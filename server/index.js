const express = require('express');
const cors = require('cors');
const mongoose = require("mongoose");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
//const User = require('./models/User.js');
// const Place = require('./models/Place.js');
// const Booking = require('./models/Booking.js');
const cookieParser = require('cookie-parser');
const fs = require('fs');
const mime = require('mime-types');
const UserModel = require('./models/user');
const { Session } = require('inspector');
const SessionModel = require('./models/Session');


require('dotenv').config();
const app = express();

const bcryptSalt = bcrypt.genSaltSync(10);
const jwtSecret = 'AZSXDCFVGBHNJMKL';

app.use(express.json());
app.use(cookieParser());

app.use(cors({
  credentials: true,
  origin: 'http://localhost:3000',
}));

function getUserDataFromReq(req) {
    return new Promise((resolve, reject) => {
      jwt.verify(req.cookies.token, jwtSecret, {}, async (err, userData) => {
        if (err) throw err;
        resolve(userData);
      });
    });
  }
  
  app.get('/api/test', (req,res) => {
    mongoose.connect(process.env.MONGO_URL);
    res.json('test ok');
  });
  
  app.post('/api/register', async (req,res) => {
    mongoose.connect(process.env.MONGO_URL);
    const {name,role,email,password,phone,description} = req.body;
    tags=Array();
    certificates="";
    rating=5;
    price=100;
    try {
      const userDoc = await UserModel.create({
        name,
        role,
        email,
        password:bcrypt.hashSync(password, bcryptSalt),
        phone,
        tags,
        description,
        certificates,
        rating,
        price,
      });
      res.json(userDoc);
    } catch (e) {
      res.status(422).json(e);
      console.log(e);
    }
  
  });
  
  app.post('/api/login', async (req,res) => {
    mongoose.connect(process.env.MONGO_URL);
    const {email,password} = req.body;
    const userDoc = await UserModel.findOne({email});
    if (userDoc) {
      const passOk = bcrypt.compareSync(password, userDoc.password);
      if (passOk) {
        jwt.sign({
          email:userDoc.email,
          id:userDoc._id
        }, jwtSecret, {}, (err,token) => {
          if (err) throw err;
          res.cookie('token', token).json(userDoc);
        });
      } else {
        res.status(422).json('pass not ok');
      }
    } else {
      res.json('not found');
    }
  });

  app.post('/api/editLearn', async (req,res) => {
    mongoose.connect(process.env.MONGO_URL);
    const {email,name,phone,description} = req.body;
    const userDoc = await UserModel.findOneAndUpdate({ email:email }, { name:name, phone:phone, description:description }, { new: true })
    if (userDoc) {
      res.json({email,name});
      } else {
        res.status(422).json('error');
      }
  });

  app.post('/api/editTeach', async (req,res) => {
    mongoose.connect(process.env.MONGO_URL);
    const {email,name,phone,description,certificates,tags,price} = req.body;
    const userDoc = await UserModel.findOneAndUpdate({ email:email }, { name:name, phone:phone, description:description, certificates:certificates, tags:tags, price:price }, { new: true })
    if (userDoc) {
      res.json({email,name});
      } else {
        res.status(422).json('error');
      }
  });
  
  app.get('/api/profile', (req,res) => {
    mongoose.connect(process.env.MONGO_URL);
    const {token} = req.cookies;
    if (token) {
      jwt.verify(token, jwtSecret, {}, async (err, userData) => {
        if (err) throw err;
        const {name,email,_id} = await UserModel.findById(userData.id);
        res.json({name,email,_id});
      });
    } else {
      res.json(null);
    }
  });
  
  app.post('/api/logout', (req,res) => {
    res.cookie('token', '').json(true);
  });


  app.get('/api/sessions', async (req,res) => {
    mongoose.connect(process.env.MONGO_URL);
    const userData = await getUserDataFromReq(req);
    res.json( await SessionModel.find({user:userData.id}).populate('user') );
  });

  const port = process.env.PORT || 4000;
  app.listen(port, () => console.log(`Listening on port ${port}...`))
  