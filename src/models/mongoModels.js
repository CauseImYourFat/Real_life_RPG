// MongoDB user schema for migration
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  id: String,
  username: String,
  password: String,
  createdAt: String
});

const userDataSchema = new mongoose.Schema({
  userId: String,
  skills: Object,
  health: Object,
  preferences: Object,
  profile: {
    description: String,
    profileImage: String
  },
  lastSaved: String
});

module.exports = {
  User: mongoose.model('User', userSchema),
  UserData: mongoose.model('UserData', userDataSchema)
};
