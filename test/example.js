process.env.TESTENV = true

let Expense = require('../app/models/expense.js')
let User = require('../app/models/user')

const crypto = require('crypto')

let chai = require('chai')
let chaiHttp = require('chai-http')
let server = require('../server')
chai.should()

chai.use(chaiHttp)

const token = crypto.randomBytes(16).toString('hex')
let userId
let expenseId

describe('Expenses', () => {
  const expenseParams = {
    title: '13 JavaScript tricks SEI instructors don\'t want you to know',
    text: 'You won\'believe number 8!'
  }

  before(done => {
    Expense.deleteMany({})
      .then(() => User.create({
        email: 'caleb',
        hashedPassword: '12345',
        token
      }))
      .then(user => {
        userId = user._id
        return user
      })
      .then(() => Expense.create(Object.assign(expenseParams, {owner: userId})))
      .then(record => {
        expenseId = record._id
        done()
      })
      .catch(console.error)
  })

  describe('GET /expenses', () => {
    it('should get all the expenses', done => {
      chai.request(server)
        .get('/expenses')
        .set('Authorization', `Token token=${token}`)
        .end((e, res) => {
          res.should.have.status(200)
          res.body.expenses.should.be.a('array')
          res.body.expenses.length.should.be.eql(1)
          done()
        })
    })
  })

  describe('GET /expenses/:id', () => {
    it('should get one expense', done => {
      chai.request(server)
        .get('/expenses/' + expenseId)
        .set('Authorization', `Token token=${token}`)
        .end((e, res) => {
          res.should.have.status(200)
          res.body.expense.should.be.a('object')
          res.body.expense.title.should.eql(expenseParams.title)
          done()
        })
    })
  })

  describe('DELETE /expenses/:id', () => {
    let expenseId

    before(done => {
      Expense.create(Object.assign(expenseParams, { owner: userId }))
        .then(record => {
          expenseId = record._id
          done()
        })
        .catch(console.error)
    })

    it('must be owned by the user', done => {
      chai.request(server)
        .delete('/expenses/' + expenseId)
        .set('Authorization', `Bearer notarealtoken`)
        .end((e, res) => {
          res.should.have.status(401)
          done()
        })
    })

    it('should be succesful if you own the resource', done => {
      chai.request(server)
        .delete('/expenses/' + expenseId)
        .set('Authorization', `Bearer ${token}`)
        .end((e, res) => {
          res.should.have.status(204)
          done()
        })
    })

    it('should return 404 if the resource doesn\'t exist', done => {
      chai.request(server)
        .delete('/expenses/' + expenseId)
        .set('Authorization', `Bearer ${token}`)
        .end((e, res) => {
          res.should.have.status(404)
          done()
        })
    })
  })

  describe('POST /expenses', () => {
    it('should not POST an expense without a title', done => {
      let noTitle = {
        text: 'Untitled',
        owner: 'fakedID'
      }
      chai.request(server)
        .post('/expenses')
        .set('Authorization', `Bearer ${token}`)
        .send({ expense: noTitle })
        .end((e, res) => {
          res.should.have.status(422)
          res.should.be.a('object')
          done()
        })
    })

    it('should not POST an expense without text', done => {
      let noText = {
        title: 'Not a very good expense, is it?',
        owner: 'fakeID'
      }
      chai.request(server)
        .post('/expenses')
        .set('Authorization', `Bearer ${token}`)
        .send({ expense: noText })
        .end((e, res) => {
          res.should.have.status(422)
          res.should.be.a('object')
          done()
        })
    })

    it('should not allow a POST from an unauthenticated user', done => {
      chai.request(server)
        .post('/expenses')
        .send({ expense: expenseParams })
        .end((e, res) => {
          res.should.have.status(401)
          done()
        })
    })

    it('should POST an expense with the correct params', done => {
      let validExpense = {
        title: 'I ran a shell command. You won\'t believe what happened next!',
        text: 'it was rm -rf / --no-preserve-root'
      }
      chai.request(server)
        .post('/expenses')
        .set('Authorization', `Bearer ${token}`)
        .send({ expense: validExpense })
        .end((e, res) => {
          res.should.have.status(201)
          res.body.should.be.a('object')
          res.body.should.have.property('expense')
          res.body.expense.should.have.property('title')
          res.body.expense.title.should.eql(validExpense.title)
          done()
        })
    })
  })

  describe('PATCH /expenses/:id', () => {
    let expenseId

    const fields = {
      title: 'Find out which HTTP status code is your spirit animal',
      text: 'Take this 4 question quiz to find out!'
    }

    before(async function () {
      const record = await Expense.create(Object.assign(expenseParams, { owner: userId }))
      expenseId = record._id
    })

    it('must be owned by the user', done => {
      chai.request(server)
        .patch('/expenses/' + expenseId)
        .set('Authorization', `Bearer notarealtoken`)
        .send({ expense: fields })
        .end((e, res) => {
          res.should.have.status(401)
          done()
        })
    })

    it('should update fields when PATCHed', done => {
      chai.request(server)
        .patch(`/expenses/${expenseId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ expense: fields })
        .end((e, res) => {
          res.should.have.status(204)
          done()
        })
    })

    it('shows the updated resource when fetched with GET', done => {
      chai.request(server)
        .get(`/expenses/${expenseId}`)
        .set('Authorization', `Bearer ${token}`)
        .end((e, res) => {
          res.should.have.status(200)
          res.body.should.be.a('object')
          res.body.expense.title.should.eql(fields.title)
          res.body.expense.text.should.eql(fields.text)
          done()
        })
    })

    it('doesn\'t overwrite fields with empty strings', done => {
      chai.request(server)
        .patch(`/expenses/${expenseId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ expense: { text: '' } })
        .then(() => {
          chai.request(server)
            .get(`/expenses/${expenseId}`)
            .set('Authorization', `Bearer ${token}`)
            .end((e, res) => {
              res.should.have.status(200)
              res.body.should.be.a('object')
              // console.log(res.body.expense.text)
              res.body.expense.title.should.eql(fields.title)
              res.body.expense.text.should.eql(fields.text)
              done()
            })
        })
    })
  })
})
