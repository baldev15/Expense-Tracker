import mongoose from 'mongoose';

const budgetSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    category: {
      type: String,
      required: [true, 'Please specify the category'],
      trim: true,
    },
    limit: {
      type: Number,
      required: [true, 'Please set a budget limit'],
      min: [0, 'Limit cannot be negative'],
    },
    month: {
      type: Number,
      required: [true, 'Please specify the month (1-12)'],
      min: [1, 'Month must be between 1 and 12'],
      max: [12, 'Month must be between 1 and 12'],
    },
    year: {
      type: Number,
      required: [true, 'Please specify the year'],
      min: [2000, 'Year must be valid'],
    },
  },
  {
    timestamps: true,
  }
);

// A user can only have one budget per category per month/year
budgetSchema.index({ user: 1, category: 1, month: 1, year: 1 }, { unique: true });

const Budget = mongoose.model('Budget', budgetSchema);

export default Budget;
