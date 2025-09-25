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
  tamagotchi: {
    mascotXP: { type: Object, default: {} }, // { mascotType: xpValue }
    purchased: { type: Object, default: {} }, // { mascotType: { name, assetFolder, actions, createdAt, editHistory } }
    shop: { type: [String], default: [] }, // available pets in shop (mascotType)
    hive: { type: [String], default: [] }, // user's hive (mascotType)
    currentMascot: { type: String, default: '' }, // currently displayed mascot
    editHistory: { type: [Object], default: [] }, // [{ mascotType, action, timestamp, details }]
  },
  lastSaved: String
});

module.exports = {
  User: mongoose.model('User', userSchema),
  UserData: mongoose.model('UserData', userDataSchema)
};
