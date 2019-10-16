const knexConfig = require('../knexfile');
const knex = require('knex');
const db = knex(knexConfig.development);

function find() {
    return db('users');
}

function findById(username) {
    return db('users')
    .where({ username });
}

function add(user) {
    return db('users')
    .insert(user);
}

module.exports = {
    find,
    add,
    findById,
}