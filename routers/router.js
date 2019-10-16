const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const Users = require('../models/users-model');
const bcrypt = require('bcryptjs');
const router = express.Router();
const sessions = require('express-session');
const jwt = require('jsonwebtoken');

const sessionConfiguration = {
    name: "cookie",
    secret: "keep it secret",
    cookie: {
        htpOnly: true,
        maxAge: 1000 * 10,
        secure: false,
    },
    resave: false,
    saveUninitialized: true,
}

router.use(sessions(sessionConfiguration));
router.use(helmet());
router.use(express.json());
router.use(cors());

router.post('/register', (req, res) => {
    const credentials = req.body;
    const hash = bcrypt.hashSync(credentials.password, 14);

    credentials.password = hash

    Users.add(credentials)
        .then( () => {
            res.status(201).json({ hash })
        })
        .catch(error => {
            res.status(500).json(error.message);
          });
})

router.post('/login', validate, (req, res) => {
    const token = generateToken(req.body)
    req.session.uid = req.body.id;
    res.status(200).json({ message: `Welcome ${req.body.username}`, token})
    
})

router.get('/users', restricted, (req, res) => {
    Users.find()
    .then(users => {
        res.status(200).json({ users })
    })
})

function validate (req, res, next) {
    let { username, password } = req.body;

    if (username && password) {
        Users.findById(username)
        .then(user => {
            if (user[0] && bcrypt.compareSync(password, user[0].password)) {
        
                req.body.id = user[0].id
                next();
            }
            else {
                res.status(401).json({ message: 'You shall not pass!!!' })
            }
        })
        .catch(error => {
            console.log(error.message)
            res.status(500).json({ message: 'Ran into unexpected error'})
        })
    } else {
        res.status(400).json({ message: 'Please provide credentials'})
    }
}

function restricted (req, res, next) {
    if (req.session && req.session.uid) {
        next();
    } else {
        res.status(400).json({ message: 'Please Login'})
    }
}

function generateToken(user) {
    const payload = {
        username: user.username,
        subject: user.id,
    };

    const secret = 'is it secret?';
    
    const options = {
        expiresIn: '1h'
    }

    return jwt.sign(payload, secret, options)
}

module.exports = router


