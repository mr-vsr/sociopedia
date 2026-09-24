import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true, minlength: 1, maxlength: 50 },
    lastName: { type: String, required: true, trim: true, minlength: 1, maxlength: 50 },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 100,
      unique: true,
    },
    password: { type: String, required: true, minlength: 5 },
    picturePath: { type: String, default: "" },
    friends: { type: Array, default: [] },
    location: { type: String, trim: true, maxlength: 100 },
    occupation: { type: String, trim: true, maxlength: 100 },
    viewedProfile: Number,
    impressions: Number,
  },
  { timestamps: true }
);

// Never send the password hash to a client, whatever the endpoint.
UserSchema.set("toJSON", {
  transform: (doc, ret) => {
    delete ret.password;
    return ret;
  },
});

const User = mongoose.model("User", UserSchema);
export default User;
