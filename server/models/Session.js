const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  student: {type:mongoose.Schema.Types.ObjectId, required:true, ref:'User'},
  mentor: {type:mongoose.Schema.Types.ObjectId, required:true, ref:'User'},
  requestDate: {type:Date, required:true},
  acceptDate: {type:Date, required:true},
  sessionDate: {type:Date, required:true},
  topic: {type:String, required:true},
  subtopic: {type:String, required:true},
  status: {type:String, required:true},
});

const SessionModel = mongoose.model('Session', sessionSchema);

module.exports = SessionModel;