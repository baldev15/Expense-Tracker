import mongoose from 'mongoose';

const expenseCategories = [
  'Food',
  'Travel',
  'Shopping',
  'Rent',
  'Entertainment',
  'Medical',
  'Education',
  'Bills',
  'Fuel',
  'Other',
];

const expenseSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: {
      type: Number,
      required: [true, 'Please add an amount'],
      min: [0, 'Amount cannot be negative'],
    },
    category: {
      type: String,
      required: [true, 'Please specify the category'],
      enum: {
        values: expenseCategories,
        message: '{VALUE} is not a valid category',
      },
    },
    paymentMethod: {
      type: String,
      required: [true, 'Please specify the payment method'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please add a description'],
      trim: true,
    },
    date: {
      type: Date,
      required: [true, 'Please add a date'],
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const Expense = mongoose.model('Expense', expenseSchema);

export default Expense;
export { expenseCategories };
