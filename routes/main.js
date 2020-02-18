const express = require('express')
const router = express.Router()
const getData = require('../modules/get_data')
const seo = require('../seo')

async function menuCategories() {
    return await getData('SELECT * FROM categories', false)
}

// define the home page route
router.get('/', async function (req, res) {

    res.locals.success = req.flash('success').toString();
    res.locals.error = req.flash('error').toString();

    let sliderData = await getData('SELECT * FROM slider WHERE visible = 1', false);
    let productsData = await getData('SELECT * FROM products WHERE top = 1 AND primary_item = 1', false);

    await res.render('home', {
        title: seo.home.title,
        description: seo.home.description,
        categories: await menuCategories(),
        slider: sliderData,
        products: productsData,
        messages: {
            success: res.locals.success,
            error: res.locals.error
        }

    })

})


router.get('/delivery', async function (req, res) {

    res.render('delivery', {
        title: seo.delivery.title,
        description: seo.delivery.description,
        categories: await menuCategories(),
    })

})

router.get('/contacts', async function (req, res) {

    res.render('contacts', {
        title: seo.contacts.title,
        description: seo.contacts.description,
        categories: await menuCategories(),
    })

})

module.exports = router