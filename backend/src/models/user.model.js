import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    fullName: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    profilePic: {
      type: String,
      default: "",
    },
    pushNotificationSubscription: {
      type: Object,
      default: null,
    },    
    friends: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    }],
    friendRequests: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    }],
    lastMessagedAt: { 
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

const User = mongoose.model('User', userSchema);
export default User;
