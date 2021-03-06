const mongoose = require('mongoose');
const slugify = require('slugify');
const geocoder = require('../utils/geocoder');

const BootcampSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'please add a name'],
      unique: true,
      trim: true,
      maxlength: [50, 'name can not be longer than 50 characters '],
    },

    slug: String,

    description: {
      type: String,
      required: [true, 'please add a description'],
      maxlength: [500, 'description can not be longer than 500 characters '],
    },

    website: {
      type: String,
      match: [
        /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
        'please provide a valid URL with HTTP or HTTPS',
      ],
    },
    phone: {
      type: String,
      maxlength: [20, 'phone can not be longer than 20 character '],
    },

    email: {
      type: String,
      match: [/^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/, 'enter a valid email'],
    },
    address: {
      type: String,
      required: [true, 'Please add an address'],
    },
    location: {
      //GeoJSON Point
      type: {
        type: String, // Don't do `{ location: { type: String } }`
        enum: ['Point'], // 'location.type' must be 'Point'
      },
      coordinates: {
        type: [Number],
        index: '2dsphere',
      },
      formattedAddress: String,
      street: String,
      city: String,
      state: String,
      zibCode: String,
      country: String,
    },
    careers: {
      // Array of strings
      type: [String],
      required: true,
      enum: ['Web Development', 'Mobile Development', 'UI/UX', 'Data Science', 'Business', 'Other'],
    },
    averageRating: {
      type: Number,
      min: [1, 'Rating must be at least 1'],
      max: [10, 'Rating must can not be more than 10'],
    },
    averageCost: Number,
    photo: {
      type: String,
      default: 'no-photo.jpg',
    },
    housing: {
      type: Boolean,
      default: false,
    },
    jobAssistance: {
      type: Boolean,
      default: false,
    },
    jobGuarantee: {
      type: Boolean,
      default: false,
    },
    acceptGi: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

//Create bootcamp slug from the name
BootcampSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

//Geocode & create location field
BootcampSchema.pre('save', async function (next) {
  const loc = await geocoder.geocode(this.address);
  this.location = {
    tepe: 'Point',
    coordinates: [loc[0].longitude, loc[0].latitude],
    formattedAddress: loc[0].formattedAddress,
    street: loc[0].streetName,
    city: loc[0].city,
    state: loc[0].stateCode,
    zibCode: loc[0].zipcode,
    country: loc[0].countryCode,
  };

  //Do not save address field in DB because we replace it with 'formattedAddress' in location field
  this.address = undefined;
  next();
});

//Cascade delete courses when a bootcamp is deleted
/*
toySchema.pre('deleteOne', function() {
  // Runs when you call `Toy.deleteOne()`
});

toySchema.pre('deleteOne', { document: true }, function() {
  // Runs when you call `doc.deleteOne()`
});*/
BootcampSchema.pre('deleteOne', { document: true }, async function (next) {
  console.log(`courses being removed from bootcamp ${this._id}`);
  await this.model('Course').deleteMany({ bootcamp: this._id });
  next();
});

//Reverse populate with virtuals
BootcampSchema.virtual('courses', {
  ref: 'Course',
  foreignField: 'bootcamp',
  localField: '_id',
  justOne: false,
});
module.exports = mongoose.model('Bootcamp', BootcampSchema);
