const getRawData = require('../modules/get_raw_data')
const categories = () => getRawData('SELECT * FROM categories', false)
module.exports = categories