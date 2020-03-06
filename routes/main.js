const express = require('express')
const router = express.Router()
const getData = require('../modules/get_data')
const seo = require('../seo')
const categories = require('../modules/categories')

router.get('/', async function (req, res) {
    res.render('home', {
        title: seo.home.title,
        categories: await categories(),
        description: seo.home.description,
        products: await getData('SELECT * FROM products WHERE top = 1 AND primary_item = 1 ORDER BY id DESC', false),
        messages: {
            success: req.flash('success').toString(),
            error: req.flash('error').toString()
        }
    })
})

router.get('/delivery', async function (req, res) {
    res.render('delivery', {
        title: seo.delivery.title,
        description: seo.delivery.description,
    })
})

router.get('/contacts', async function (req, res) {
    res.render('contacts', {
        title: seo.contacts.title,
        description: seo.contacts.description,
    })
})

module.exports = router