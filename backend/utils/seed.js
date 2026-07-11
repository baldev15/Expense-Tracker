import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Income from '../models/Income.js';
import Expense from '../models/Expense.js';
import Budget from '../models/Budget.js';

// Load env vars
dotenv.config();

const seedData = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/smart-expense-tracker';
    console.log(`Connecting to database at ${mongoURI}...`);
    await mongoose.connect(mongoURI);
    console.log('Database Connected.');

    // 1. Clean existing seed data
    const email = 'demo@example.com';
    let demoUser = await User.findOne({ email });

    if (demoUser) {
      console.log('Cleaning existing records for demo user...');
      await Income.deleteMany({ user: demoUser._id });
      await Expense.deleteMany({ user: demoUser._id });
      await Budget.deleteMany({ user: demoUser._id });
      await User.deleteOne({ _id: demoUser._id });
    }

    // 2. Create Demo User
    console.log('Creating demo user...');
    demoUser = await User.create({
      name: 'Demo User',
      email,
      password: 'Password123',
      avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=DemoUser',
    });
    console.log(`Demo user created with ID: ${demoUser._id}`);

    // Helper to construct dates relative to today
    const getRelativeDate = (daysAgo) => {
      const date = new Date();
      date.setDate(date.getDate() - daysAgo);
      return date;
    };

    // Current month/year context
    const today = new Date();
    const currMonth = today.getMonth() + 1;
    const currYear = today.getFullYear();

    // Previous month context
    const prevMonthDate = new Date();
    prevMonthDate.setMonth(prevMonthDate.getMonth() - 1);
    const prevMonth = prevMonthDate.getMonth() + 1;
    const prevYear = prevMonthDate.getFullYear();

    // 3. Create Incomes
    console.log('Seeding incomes...');
    const incomes = [
      // Current Month
      { user: demoUser._id, amount: 75000, source: 'Salary', date: getRelativeDate(today.getDate() - 1), notes: 'Monthly corporate salary credit' },
      { user: demoUser._id, amount: 15000, source: 'Freelance UI/UX design', date: getRelativeDate(4), notes: 'Contract payment for client design project' },
      { user: demoUser._id, amount: 5000, source: 'Investments Dividends', date: getRelativeDate(2), notes: 'Stock market payouts' },
      
      // Last Month
      { user: demoUser._id, amount: 75000, source: 'Salary', date: new Date(prevYear, prevMonth - 1, 1), notes: 'Monthly corporate salary credit' },
      { user: demoUser._id, amount: 12000, source: 'Freelance UI/UX design', date: new Date(prevYear, prevMonth - 1, 15), notes: 'Freelance development work' },
      
      // 2 Months Ago
      { user: demoUser._id, amount: 75000, source: 'Salary', date: new Date(today.getFullYear(), today.getMonth() - 2, 1), notes: 'Monthly corporate salary credit' }
    ];
    await Income.insertMany(incomes);

    // 4. Create Expenses
    console.log('Seeding expenses...');
    const expenses = [
      // Today
      { user: demoUser._id, amount: 450, category: 'Food', paymentMethod: 'UPI', description: 'Lunch at office cafeteria', date: getRelativeDate(0) },
      { user: demoUser._id, amount: 1500, category: 'Shopping', paymentMethod: 'Credit Card', description: 'Bought new wireless mouse', date: getRelativeDate(0) },
      
      // Yesterday
      { user: demoUser._id, amount: 350, category: 'Travel', paymentMethod: 'Cash', description: 'Cab fare to client meeting', date: getRelativeDate(1) },
      { user: demoUser._id, amount: 1200, category: 'Entertainment', paymentMethod: 'Debit Card', description: 'Movie tickets and popcorn with friends', date: getRelativeDate(1) },
      
      // Last 7 days
      { user: demoUser._id, amount: 800, category: 'Fuel', paymentMethod: 'Credit Card', description: 'Petrol refill for car', date: getRelativeDate(3) },
      { user: demoUser._id, amount: 2200, category: 'Medical', paymentMethod: 'UPI', description: 'Monthly health checkup medicines', date: getRelativeDate(4) },
      { user: demoUser._id, amount: 3200, category: 'Bills', paymentMethod: 'Debit Card', description: 'Electric bill payment', date: getRelativeDate(5) },
      { user: demoUser._id, amount: 950, category: 'Food', paymentMethod: 'UPI', description: 'Weekend dinner with family', date: getRelativeDate(6) },
      
      // Last 30 days
      { user: demoUser._id, amount: 25000, category: 'Rent', paymentMethod: 'Bank Transfer', description: 'Apartment monthly rent', date: getRelativeDate(today.getDate() - 1) },
      { user: demoUser._id, amount: 1200, category: 'Travel', paymentMethod: 'UPI', description: 'Train pass renewal', date: getRelativeDate(12) },
      { user: demoUser._id, amount: 4500, category: 'Shopping', paymentMethod: 'Credit Card', description: 'Sneakers from Nike', date: getRelativeDate(15) },
      { user: demoUser._id, amount: 500, category: 'Education', paymentMethod: 'UPI', description: 'Online course subscription', date: getRelativeDate(18) },
      { user: demoUser._id, amount: 2500, category: 'Bills', paymentMethod: 'UPI', description: 'Broadband and mobile bills', date: getRelativeDate(20) },
      { user: demoUser._id, amount: 1800, category: 'Entertainment', paymentMethod: 'Credit Card', description: 'Amusement park entry pass', date: getRelativeDate(22) },
      { user: demoUser._id, amount: 1200, category: 'Food', paymentMethod: 'Cash', description: 'Groceries store purchase', date: getRelativeDate(25) },
      { user: demoUser._id, amount: 350, category: 'Other', paymentMethod: 'Cash', description: 'House cleaning materials', date: getRelativeDate(28) },
      
      // Last Month
      { user: demoUser._id, amount: 25000, category: 'Rent', paymentMethod: 'Bank Transfer', description: 'Apartment rent', date: new Date(prevYear, prevMonth - 1, 1) },
      { user: demoUser._id, amount: 8000, category: 'Food', paymentMethod: 'UPI', description: 'Grocery shopping monthly bulk', date: new Date(prevYear, prevMonth - 1, 5) },
      { user: demoUser._id, amount: 3500, category: 'Shopping', paymentMethod: 'Credit Card', description: 'Birthday gift purchase', date: new Date(prevYear, prevMonth - 1, 12) },
      { user: demoUser._id, amount: 1500, category: 'Travel', paymentMethod: 'Cash', description: 'Local commute expenses', date: new Date(prevYear, prevMonth - 1, 18) },
      { user: demoUser._id, amount: 4200, category: 'Entertainment', paymentMethod: 'UPI', description: 'Weekend concert trip', date: new Date(prevYear, prevMonth - 1, 25) },
      
      // 2 Months Ago
      { user: demoUser._id, amount: 25000, category: 'Rent', paymentMethod: 'Bank Transfer', description: 'Apartment rent', date: new Date(today.getFullYear(), today.getMonth() - 2, 1) },
      { user: demoUser._id, amount: 7200, category: 'Food', paymentMethod: 'UPI', description: 'Monthly groceries', date: new Date(today.getFullYear(), today.getMonth() - 2, 5) },
      { user: demoUser._id, amount: 6000, category: 'Education', paymentMethod: 'Bank Transfer', description: 'Coding bootcamp fees', date: new Date(today.getFullYear(), today.getMonth() - 2, 10) },
      { user: demoUser._id, amount: 1800, category: 'Travel', paymentMethod: 'Cash', description: 'Car pooling fuel share', date: new Date(today.getFullYear(), today.getMonth() - 2, 15) }
    ];
    await Expense.insertMany(expenses);

    // 5. Create Budgets (Some exceeding to trigger warnings)
    console.log('Seeding budgets...');
    const budgets = [
      // Current Month Budgets
      { user: demoUser._id, category: 'Food', limit: 10000, month: currMonth, year: currYear }, // Spent: 1400 (Within)
      { user: demoUser._id, category: 'Rent', limit: 25000, month: currMonth, year: currYear }, // Spent: 25000 (Exact limit)
      { user: demoUser._id, category: 'Shopping', limit: 5000, month: currMonth, year: currYear }, // Spent: 6000 (Exceeded!)
      { user: demoUser._id, category: 'Travel', limit: 3000, month: currMonth, year: currYear }, // Spent: 1550 (Within)
      { user: demoUser._id, category: 'Entertainment', limit: 2500, month: currMonth, year: currYear }, // Spent: 3000 (Exceeded!)
      { user: demoUser._id, category: 'Bills', limit: 7000, month: currMonth, year: currYear }, // Spent: 5700 (Within)
      
      // Last Month Budgets
      { user: demoUser._id, category: 'Food', limit: 10000, month: prevMonth, year: prevYear },
      { user: demoUser._id, category: 'Rent', limit: 25000, month: prevMonth, year: prevYear },
      { user: demoUser._id, category: 'Shopping', limit: 5000, month: prevMonth, year: prevYear }
    ];
    await Budget.insertMany(budgets);

    console.log('Database seeded successfully!');
    console.log('\n======================================================');
    console.log('DEMO ACCOUNT INFO:');
    console.log(`Email: ${email}`);
    console.log('Password: Password123');
    console.log('======================================================\n');

    await mongoose.disconnect();
    console.log('Database Disconnected.');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error.message);
    process.exit(1);
  }
};

seedData();
