const express = require('express')
const router = express.Router()
const getData = require('../modules/get_data')
require('datejs')

async function menuCategories() {
    return await getData('SELECT * FROM categories', false)
}

// define the home page route
router.get('/', async function (req, res) {

    res.locals.success = req.flash('success').toString();
    res.locals.error = req.flash('error').toString();

    let sliderData = await getData('SELECT * FROM slider WHERE visible = 1', false);
    let productsData = await getData('SELECT * FROM products WHERE top = 1 AND primary_item = 1', false);

    news.forEach(item => {
        item.date = Date.parse(item.date).toString('d.MM.yyyy')
    })

    await res.render('home', {
        title: 'Homepage',
        categories: await menuCategories(),
        slider: sliderData,
        products: productsData,
        news: news,
        messages: {
            success: res.locals.success,
            error: res.locals.error
        }

    })

})


router.get('/delivery', async function (req, res) {

    res.render('delivery', {
        title: 'Оплата и доставка',
        categories: await menuCategories(),
    })

})

router.get('/contacts', async function (req, res) {

    res.render('contacts', {
        title: 'Контакты',
        categories: await menuCategories(),
    })

})

module.exports = router