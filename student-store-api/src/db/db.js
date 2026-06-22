const path = require('path')
// The .env file lives at the project root (Project4-Student-Store/.env),
// two levels up from this file's folder (src/db). Resolve it from __dirname
// so it loads no matter which directory the process is started from.
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') })

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

module.exports = prisma
