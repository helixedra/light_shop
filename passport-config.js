const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt')
const getData = require('./modules/get_data')

function initialize(passport, getUserByEmail, getUserById) {
    const authenticateUser = async (email, password, done) => {

        // const user = await getUserByEmail(email)
        const user = await getData('SELECT * FROM customers WHERE email = ?', email)
        //...
        // console.log(user);
        // console.log(user);
        // console.log(user.password);
        
        if(user == null) {
            return done(null, false, { message: 'User have not found' })
            // return false
        }

        try {
            if (await bcrypt.compare(password, user.password)) {
                return done(null, user)
                // return user
            } else {
                return done(null, false, { message: 'Password incorrect'})
            }
        } catch (e) {
            return done(e)
        }
    }
    passport.use(new LocalStrategy({ usernameField: 'email'}, authenticateUser))
    passport.serializeUser((user, done) => done(null, user.id))
    passport.deserializeUser((id, done) => { 
        return done(null, getUserById(id))
    })
}

module.exports = initialize