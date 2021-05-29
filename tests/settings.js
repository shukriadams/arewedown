const process = require('process'),
    settings = {}

settings.url = process.env.TEST_URL || 'http://localhost:3000'

module.exports = settings