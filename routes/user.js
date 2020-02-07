const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const passport = require('passport')
const connection = require('../modules/db_connect')
const mailer = require('../modules/mailer')
const confimationToken = require('../modules/ctoken')
const { check, validationResult } = require('express-validator')
const getData = require('../modules/get_data')

// --- checkAuth ---
function checkAuth(req, res, next) {
    if (req.isAuthenticated()) {
        return next()
    } else {
        res.redirect('/')
    }
}
// --- checkNotAuth ---
function checkNotAuth(req, res, next) {
    if (req.isAuthenticated()) {
        //   return res.redirect('/user/profile')
        res.send(true)
    }
    next()
}

// --- INSERT DATA TO DATABASE ---
function insertData(query, params) {
    return new Promise(resolve => {
        connection.query(query, params, function (err) {
            if (err) throw err
            resolve(true)
        });
    })
}
// --- UPDATE DATA TO DATABASE ---
function updateData(query, params) {
    return new Promise(resolve => {
        connection.query(query, params, function (err) {
            if (err) throw err
            resolve(true)
        });
    })
}



// router.get('/login', checkNotAuth, function (req, res) {
//     // req.flash('error', error)

//     // let msg = ''

//     // if (req.query.msg === 'success') {
//     //     msg = 'User have been added seccessfully'
//     // } else if (req.query.msg === 'error') {
//     //     msg = 'Something went wrong. Please try again'
//     // } else {
//     //     msg = false
//     // }

//     // res.render('login', {
//     //     title: 'Login',
//     //     msg: msg
//     // })
//     res.send(false)
// })

router.get('/login', async function (req, res) {
    // console.log(req.session.passport.user);


    if (req.query.status === 'success') {
        res.send({
            status: 'success',
            message: req.flash('success').toString(),
        })
    } else if (req.query.status === 'error') {
        res.send({
            status: 'error',
            message: req.flash('error').toString()
        })
    } else if (req.query.auth == 'status') {
        if (req.isAuthenticated()) {
            res.send({
                status: true,
                name: await getData('SELECT name FROM customers WHERE id = ?', req.session.passport.user)
            })
        } else {
            res.send({
                status: false
            })
        }
    } else {
        res.status(404).send('404 NOT FOUND')
    }

})



router.get('/confirmation', async function (req, res) {

    // Parse link and compare to DB records
    const email = req.query.email
    const key = req.query.key

    if (email !== '' && key !== '') {

        // Search and compare data from link to DB 
        let tmpUser = await getData('SELECT * FROM temp_users WHERE email = ? AND a_key = ?', [email, key])

        if (tmpUser !== null) {
            // If record exist change user status to 'active'
            let confirmUser = await updateData('UPDATE customers SET status = "active" WHERE email = ?', [email])

            if (confirmUser) {
                // If status have changed remove temporary user record
                await updateData('DELETE FROM temp_users WHERE email = ? AND a_key = ?', [email, key])

                // Return success message
                res.send('Email confirmed!') // REPLACE TO TEMPLATE

            }

        } else {
            res.sendStatus(422).send('User have not found') // Change to error template
        }
    } else {

        // If query parameters missing redirect to home
        res.redirect('/')
    }

})

router.get('/registration', checkNotAuth, function (req, res) {
    res.send(req.flash('message')[0])
})

router.post('/registration', [check('email').isEmail()], async (req, res) => {

    /*
    
     -----------------------------

     Check if email exist in db to prevent duplicate

     -----------------------------
    
    */

    const errors = validationResult(req)
    const name = req.body.name
    const email = req.body.email
    const password = req.body.password
    const host = req.headers.origin

    let emailCheck = await getData('SELECT email FROM customers WHERE email = ?', [email])

    if (emailCheck !== null) {
        req.flash('message', {
            status: 'error',
            message: 'Пользователь с таким e-mail адресом уже зарегистрирован'
        })
        res.redirect('/user/registration');
        return // break and redirect with error
    }

    if (!errors.isEmpty()) {
        // If validation not passed return errors
        return res.sendStatus(422).json({ errors: errors.array() }) // change
    }

    try {
        // Create activation key
        const key = confimationToken()

        // Save confirmation data to DB
        const insertTempUser = await insertData("INSERT INTO temp_users (email, a_key) VALUES (?, ?)", [email, key])

        // Create password hash
        const hashPass = await bcrypt.hash(password, 10)

        const insertUser = await insertData("INSERT INTO customers (name, email, phone, password, status) VALUES (?, ?, ?, ?, 'inactive')", [req.body.name, req.body.email, req.body.phone, hashPass])

        // Create confirmation link
        const confirmationLink = `${host}/user/confirmation?email=${email}&key=${key}`

        const mail = {
            from: '"Lansot" <sales@lansot.com>',
            to: req.body.email,
            subject: 'Подтверждение регистрации Lansot',
            template: 'registration_confirmation_email',
            context: {
                client_name: name,
                client_email: email,
                client_link: confirmationLink
            }
        }

        let info = await mailer.sendMail(mail)


        if (insertUser) {

            //If email has been sent then render success template
            // res.send('User added')
            // return done(null, false, { message: 'User have been added seccessfully'})
            res.redirect('/user/login?msg=success')
        } else {
            // return done(null, false, { message: 'Something went wrong. Please try again'})
            res.redirect('/user/login?msg=error')
            // res.send('Something went wrong')
        }
        // res.send(`register...<br>${req.body.name}<br>${req.body.email}<br>${req.body.password}<br>PASSHASH: ${hashPass}`)


        // res.redirect('/user/login') // redirect to login when success

    } catch (error) {

        res.send(error)

        // doing something when failure

    }

})

router.post('/login', [check('email').isEmail()], passport.authenticate('local', {
    successRedirect: '/user/login?status=success',
    successFlash: true,
    failureRedirect: '/user/login?status=error',
    failureFlash: true
}))

router.get('/logout', (req, res) => {
    req.logOut()
    res.redirect('/')
})

// router.post('/login', function (req, res) {
//     res.send('login...')
// })

router.get('/profile', checkAuth, async function (req, res) {


    const userData = await getData('SELECT * FROM customers WHERE id = ?', req.session.passport.user)

    const address = userData.address.split(';')


    if (userData !== null) {
        res.render('profile', {
            title: 'User Profile',
            user: {
                name: userData.name,
                email: userData.email,
                phone: userData.phone,
                address: address
            }
        })
    }
})

// Parse order string
function itemParser(input) {
    return input.split(',').map(item => {
        return item.replace(/[a-z=]/gi, '').split(';')
    }).map(item => {

        return {
            pid: +item[0],
            qty: +item[1],
            price: +item[2]
        }


    })
}


router.get('/orders', checkAuth, async function (req, res) {

    let orders = await getData('SELECT * FROM orders WHERE client_id = ?', req.session.passport.user)

    if (orders !== null) {
        orders = orders.map(order => {
            order.order_items = itemParser(order.order_items)
            return order
        })
    } else {
        orders = null
    }

    let ordersProductsIds = []

    orders.map(item => {
        item.order_items.map(item => {
            if (!ordersProductsIds.includes(item.pid)) ordersProductsIds.push(item.pid)
        })
    })

    ordersProductsIds = ordersProductsIds.join()

    const ordersProductsData = await getData('SELECT id,ref,title,uri,cover_img,color,size FROM products WHERE id IN (' + ordersProductsIds + ')')

    let newOrders = orders.map(item => {
        item.order_items = item.order_items.map(order => {
            let product = ordersProductsData.find(p => p.id === order.pid)
            return order = {
                id: order.pid,
                qty: order.qty,
                price: order.price,
                ref: product.ref,
                uri: product.uri,
                title: product.title,
                cover_img: product.cover_img,
                color: product.color,
                size: product.size
            }
        })
        return item
    })

    res.render('orders', {
        title: 'Orders',
        orders: newOrders
    })

})

module.exports = router