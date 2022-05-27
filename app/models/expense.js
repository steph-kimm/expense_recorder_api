const { Number } = require('mongoose')
const mongoose = require('mongoose')

const expenseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  text: {
    type: String,
    required: false
  },
  date: {
    type: Date,
    required: true
  },
  // DATE="2023-01-25"
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
})

module.exports = mongoose.model('Expense', expenseSchema)
