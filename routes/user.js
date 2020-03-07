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


router.get('/login', async function (req, res) {

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


    // Create activation key
    let key = confimationToken()

    // Save confirmation data to DB
    let insertTempUser = await insertData("INSERT INTO temp_users (email, a_key) VALUES (?, ?)", [email, key])

    // Create password hash
    let hashPass = await bcrypt.hash(password, 10)

    let insertUser = await insertData("INSERT INTO customers (name, email, phone, password, status) VALUES (?, ?, ?, ?, 'inactive')", [req.body.name, req.body.email, req.body.phone, hashPass])

    // Create confirmation link
    let confirmationLink = `${host}/user/confirmation?email=${email}&key=${key}`

    if (insertUser) {
        let mailReg = {
            from: '"Lansot" <sales@lansot.com>',
            to: email,
            subject: 'Подтверждение регистрации Lansot',
            template: 'registration_confirmation_email',
            context: {
                site_url: req.headers.origin,
                client_name: name,
                client_email: email,
                client_link: confirmationLink
            }
        }

        let sendMail = await mailer.sendMail(mailReg)

        if (insertUser && sendMail) {

            //If email has been sent then render success template
            // res.send('User added')
            // return done(null, false, { message: 'User have been added seccessfully'})
            // res.redirect('/user/login?msg=success')
            req.flash('message', {
                status: 'success',
                message: 'Вы успешно зарегистрированы! На вашу электронную почту мы отправили письмо. Пожалуйста пройдите по ссылке в письме.'
            })
            // res.redirect('/')
            res.redirect('/user/registration');
        } else {
            req.flash('message', {
                status: 'error',
                message: 'Something went wrong. Please try again'
            })
            res.redirect('/user/registration');
            // return done(null, false, { message: 'Something went wrong. Please try again'})
            // res.redirect('/user/login?msg=error')
            // res.send('Something went wrong')
        }
        // res.send(`register...<br>${req.body.name}<br>${req.body.email}<br>${req.body.password}<br>PASSHASH: ${hashPass}`)


        // res.redirect('/user/login') // redirect to login when success

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

    let orders = await getData('SELECT * FROM orders WHERE client_id = ? ORDER BY id DESC', req.session.passport.user)



    if (orders !== null) {
        if (!Array.isArray(orders)) orders = [orders]

        orders = orders.map(order => {
            order.order_items = itemParser(order.order_items)
            return order
        })

        let ordersProductsIds = []

        orders.map(item => {
            item.order_items.map(item => {
                if (!ordersProductsIds.includes(item.pid)) ordersProductsIds.push(item.pid)
            })
        })

        ordersProductsIds = ordersProductsIds.join()

        let ordersProductsData = await getData('SELECT id,ref,title,uri,cover_img,color,size FROM products WHERE id IN (' + ordersProductsIds + ')')

        if (!Array.isArray(ordersProductsData)) ordersProductsData = [ordersProductsData]
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

    } else {
        res.render('orders', {
            title: 'Orders',
            orders: false
        })
    }
})

module.exports = router