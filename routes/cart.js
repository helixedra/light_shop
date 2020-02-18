const express = require('express')
const router = express.Router()
const insertData = require('../modules/insert_data')
const getData = require('../modules/get_data')
const getRawData = require('../modules/get_raw_data')
const mailer = require('../modules/mailer')
const NodeCache = require("node-cache");
const myCache = new NodeCache({ stdTTL: 120, checkperiod: 140 });


// Get data from DB and save to cache
async function cacheCart(ids) {
    // Get and save data to cache
    let data = (ids.length !== 0) ? await getRawData('SELECT id, uri, cover_img, title, price FROM products WHERE id IN (' + ids + ') ORDER BY FIND_IN_SET(id,"' + ids + '")', false) : false
    let cartData = {
        ids: ids,
        data: data
    }
    // Saving data to cache
    myCache.set('cartData', cartData, 10000);
    return data // return data from db
}

// Get product data from DB by ids
router.post('/getcart', async function (req, res) {
    let ids = Object.values(req.body).toString()
    let cachedData = myCache.get('cartData')
    let data
    // Cache have no data
    if (cachedData === undefined) {
        data = await cacheCart(ids)
    } else {
        data = (cachedData.ids === ids) ? cachedData.data : await cacheCart(ids)
    }
    (data === null) ? res.send() : res.send(data)
})


/* CHECKOUT ROUTER */
router.get('/checkout', async function (req, res) {

    //Check if user is logged in
    if (req.session.passport !== undefined && Object.entries(req.session.passport).length !== 0) {

        const userId = req.session.passport.user

        //User is logged in
        let user = await getData('SELECT * FROM customers WHERE id = ?', userId)

        if (user !== null) {

            res.render('checkout', {
                title: 'Оформление заказа',
                cart: '',
                user: {
                    id: user.id,
                    name: user.name,
                    phone: user.phone,
                    email: user.email,
                    address: user.address.split(';')
                }
            })

        } else {

            res.render('checkout', {
                title: 'Оформление заказа',
                cart: '',
                user: { id: 0 }
            })
        }

    } else {

        //User in NOT logged in
        res.render('checkout', {
            title: 'Оформление заказа',
            cart: '',
            user: {
                id: 0,
                name: '',
                phone: '',
                email: '',
                address: ''
            }
        })
    }


})


function combine(pid, item_title, qty, item_price) {
    let data = []
    if (Array.isArray(pid)) {
        for (let i = 0; pid.length > i; i++) {
            data.push({
                pid: pid[i],
                item_title: item_title[i],
                qty: qty[i],
                item_price: item_price[i]
            })
        }
    } else {
        data = [{
            pid: pid,
            item_title: item_title,
            qty: qty,
            item_price: item_price
        }]
    }
    return data
}

/* CHECKOUT POST */
router.post('/checkout', async function (req, res) {

    console.log(req.body);

    if (req.body.delivery_opt_id == 1) req.body.delivery_address = req.body.np_address = '';
    if (req.body.delivery_opt_id == 3) req.body.delivery_address = '';

    if (Array.isArray(req.body.delivery_address)) req.body.delivery_address = req.body.delivery_address.join('')


    /*
    --------------------
    
    Checkout Validation 

    --------------------
    */

    //If data passed then insert to DB
    if (req.body.phone !== '' && req.body.email !== '' && req.body.order !== '') {

        let newOrder = await insertData('INSERT INTO orders (id, client_name, client_phone, client_email, client_id, delivery_option, payment_option, delivery_address, delivery_price, np_address, order_items, total, order_status) VALUES (NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [req.body.name, req.body.phone, req.body.email, req.body.client_id, req.body.delivery_option, req.body.payment_option, req.body.delivery_address, req.body.delivery_price, req.body.np_address, req.body.order, req.body.total, "new"])

        let orderItems = combine(req.body.pid, req.body.item_title, req.body.qty, req.body.item_price)

        if (newOrder) {
            //If data has been add to DB then send mail with options
            let customerMail = {
                from: '"Lansot" <sales@lansot.com>',
                to: req.body.email,
                subject: 'Ваш заказ №' + newOrder.insertId + ' принят',
                template: 'checkout_client_email',
                context: {
                    client_name: req.body.name,
                    order_id: newOrder.insertId
                }
            }
            let salesMail = {
                from: '"Lansot" <sales@lansot.com>',
                to: 'sales@lansot.com',
                subject: 'Новый заказ №' + newOrder.insertId + '',
                template: 'checkout_sales_email',
                context: {
                    order_id: newOrder.insertId,
                    orders: orderItems,
                    order_total: req.body.total,
                    delivery: `Способ доставка: ${req.body.delivery_option}; ${req.body.delivery_address} / НП: ${req.body.np_address}`,
                    payment: req.body.payment_option
                }
            }
            let info = await mailer.sendMail(customerMail)
            let sales = await mailer.sendMail(salesMail)
            //If email has been sent then render success template
            if (info, sales) {
                //Render success template
                res.render('checkout_success', {
                    title: 'Ваш заказ принят',
                    order_id: newOrder.insertId,
                    success: true
                })
            }
        }
    }
})

module.exports = router