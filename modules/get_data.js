const db = require('./db_connect')
function getData(query, params) {
    return new Promise(resolve => {
        db.query(query, params, function (err, result) {
            
            if (err) throw err

            if(result.length === 0) {
                resolve(null)
            } else if (result.length > 1) {
                resolve(JSON.parse(JSON.stringify(result)))
            } else {
                resolve(JSON.parse(JSON.stringify(result[0])))
            }

        })
    })
}
module.exports = getData