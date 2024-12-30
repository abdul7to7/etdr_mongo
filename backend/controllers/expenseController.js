const { mongoose } = require("mongoose");
const Expense = require("../models/Expense");
const User = require("../models/User");

exports.getAllExpenses = async (req, res, next) => {
  try {
    const expenses = await Expense.find({ userId: req.user.id });
    return res.status(200).json({
      success: true,
      expenses: expenses,
      user: {
        username: req.user.username,
        isPremium: req.user.isPremium,
        totalExpense: req.user.totalExpense,
      },
    });
  } catch (e) {
    return res.status(500).json({
      success: false,
      message: `Something went wrong: ${e.message}`,
    });
  }
};

exports.getAllExpensesByPage = async (req, res, next) => {
  try {
    let page = Number(req.query.page) || 1;
    let size = Number(req.query.size) || 10;
    const expenses = await Expense.find({ userId: req.user.id })
      .skip((page - 1) * size)
      .limit(size);

    const totalExpenses = await Expense.countDocuments({
      userId: req.user.id,
    });

    return res.status(200).json({
      success: true,
      expenses: expenses,
      user: {
        username: req.user.username,
        isPremium: req.user.isPremium,
        totalExpense: req.user.totalExpense,
      },
      lastPage: Math.ceil(totalExpenses / size) <= page,
    });
  } catch (e) {
    return res.status(500).json({
      success: false,
      message: `Something went wrong: ${e.message}`,
    });
  }
};

exports.addExpense = async (req, res, next) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const expense = new Expense({
      amount: req.body.amount,
      description: req.body.description,
      category: req.body.category,
      userId: req.user.id,
    });

    await expense.save({ session });

    if (req.body.amount < 0) {
      await User.updateOne(
        { _id: req.user.id },
        { $inc: { totalExpense: req.body.amount * -1 } },
        { session }
      );
    }

    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({
      success: true,
      message: "Expense created successfully",
      expense: expense,
    });
  } catch (e) {
    await session.abortTransaction();
    session.endSession();

    return res.status(500).json({
      success: false,
      message: `Something went wrong: ${e.message}`,
    });
  }
};

exports.deleteExpense = async (req, res, next) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const expense = await Expense.findById(req.params.expense_id);
    if (!expense) {
      return res
        .status(404)
        .json({ success: false, message: "Expense not found" });
    }

    await Expense.deleteOne(
      { _id: req.params.expense_id, userId: req.user.id },
      { session }
    );

    // Decrease the user's total expense
    if (expense.amount < 0) {
      await User.updateOne(
        { _id: req.user.id },
        { $inc: { totalExpense: expense.amount } },
        { session }
      );
    }

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      success: true,
      message: "Expense deleted successfully",
    });
  } catch (e) {
    await session.abortTransaction();
    session.endSession();

    return res.status(500).json({
      success: false,
      message: `Something went wrong: ${e.message}`,
    });
  }
};

exports.getLeaderboard = async (req, res, next) => {
  try {
    const usersWithExpenses = await User.find()
      .select("username totalExpense")
      .sort({ totalExpense: -1 });

    return res.status(200).json({
      usersWithExpenses: usersWithExpenses,
    });
  } catch (e) {
    return res.status(500).json({
      success: false,
      message: `Something went wrong: ${e.message}`,
    });
  }
};
