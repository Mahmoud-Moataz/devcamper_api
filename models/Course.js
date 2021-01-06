const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    required: [true, 'please add a course title'],
  },
  description: {
    type: String,
    required: [true, 'please add a description'],
  },
  weeks: {
    type: String,
    required: [true, 'please add a number of weeks'],
  },
  tuition: {
    type: Number,
    required: [true, 'please add a tuition cost'],
  },
  minimumSkill: {
    type: String,
    required: [true, 'please add a minimum skill'],
    enum: ['beginner', 'intermediate', 'advanced'],
  },
  scholarshipAvailable: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  bootcamp: {
    type: mongoose.Schema.ObjectId,
    ref: 'Bootcamp',
    required: true,
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
});

//staic method to get average of course tuitions
courseSchema.statics.getAverageCost = async function (bootcampId) {
  const obj = await this.aggregate([
    { $match: { bootcamp: bootcampId } },
    {
      $group: { _id: '$bootcamp', averageCost: { $avg: '$tuition' } },
    },
  ]);
  try {
    await this.model('Bootcamp').findByIdAndUpdate(bootcampId, {
      averageCost: Math.ceil(obj[0].averageCost / 10) * 10,
    });
  } catch (err) {
    console.error(err);
  }
};
//Call getAverageCost after save
courseSchema.post('save', function (doc, next) {
  // Here  doc = this
  this.constructor.getAverageCost(this.bootcamp);
  next();
});

//Call getAverageCost pre remove
courseSchema.pre('remove', async function (next) {
  await this.constructor.getAverageCost(this.bootcamp);
  next();
});

module.exports = mongoose.model('Course', courseSchema);
