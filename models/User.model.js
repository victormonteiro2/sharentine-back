const { Schema, model } = require('mongoose');

const UserSchema = new Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true]
    },

    lastName: {
      type: String,
      trim: true
      // default: ''
    },

    email: {
      type: String,
      required: [true],
      unique: true,
      lowercase: true,
      trim: true
    },

    passwordHash: {
      type: String,
      required: [true]
    },

    location: {
      type: String,
      trim: false
      // default: ''
    },

    image: {
      type: String,
      default: (src =
        'https://res.cloudinary.com/dbthudmai/image/upload/v1602808218/defaultAvatar_iebqlk.png')
    },

    posts: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Post'
      }
    ]
  },
  { timestamps: true }
);

module.exports = model('User', UserSchema);
