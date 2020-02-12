const db = require('./db_connect')
function getRawData(query, params) {
    return new Promise(resolve => {
        db.query(query, params, function (err, result) {

            if (err) throw err

            if (result.length === 0) {
                resolve(null)
            } else {
                resolve(result)
            }

        })
    })
}
module.exports = getRawData