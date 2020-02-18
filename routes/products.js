const express = require('express')
const router = express.Router()
const getData = require('../modules/get_data')


// SUPPORT FUNCTIONS
function toArray(str) {
    if (str !== '') {
        return str.replace(' ', '').split(',')
    } else {
        return false
    }
}

function convertData(data) {
    if (data !== null) {
        if (data.length > 1) {
            return { ...data }
        } else {
            return { data }
        }
    } else {
        return false
    }
}

//------------------------------
// ***** ROUTER /products/ *****
//------------------------------

// CATEGORY
router.get('/c/:ref', async function (req, res) {

    let getAllCategories = await getData('SELECT * FROM categories', false)

    let categoryData = getAllCategories.filter(category => category.ref === req.params.ref)
    categoryData = { ...categoryData[0] }

    if (categoryData !== undefined) {

        if (req.query.sort === undefined || req.query.sort === 'rating') {

            req.query.sort = 'rating'

            let productsData = await getData('SELECT * FROM products WHERE category = ? AND primary_item = 1 ORDER BY ?? ASC', [categoryData.id, req.query.sort])

            if (productsData === null) {
                productsData = false
            } else {
                productsData = { productsData }
            }

            res.render('category', {
                title: categoryData.title,
                description: categoryData.title,
                categories: getAllCategories,
                category: categoryData,
                // slider: sliderData,
                products: productsData,
                sort: 'По популярности'
            })

        } else if (req.query.sort === 'priceup') {

            let productsData = await getData('SELECT * FROM products WHERE category = ? AND primary_item = 1 ORDER BY price ASC', categoryData.id)

            if (productsData === null) {
                productsData = false
            } else {
                productsData = { productsData }
            }

            res.render('category', {
                title: categoryData.title,
                description: categoryData.title,
                categories: getAllCategories,
                category: categoryData,
                // slider: sliderData,
                products: productsData,
                sort: 'От дешевых к дорогим'
            })

        } else if (req.query.sort === 'pricedown') {

            let productsData = await getData('SELECT * FROM products WHERE category = ? AND primary_item = 1  ORDER BY price DESC', categoryData.id)

            if (productsData === null) {
                productsData = false
            } else {
                productsData = { productsData }
            }

            res.render('category', {
                title: categoryData.title,
                description: categoryData.title,
                categories: getAllCategories,
                category: categoryData,
                // slider: sliderData,
                products: productsData,
                sort: 'От дорогих к дешевым'
            })

        } else {
            res.status(404).render('404')
        }

    } else {
        res.status(404).render('404')
    }
})

// PRODUCT PAGE
router.get('/p/:id', async function (req, res) {

    if (req.params.id && req.query.color && req.query.size) {

        // Get product data from DB by id and options
        let productData = await getData('SELECT * FROM products JOIN sizes ON products.size = sizes.size_id WHERE products.id = ? AND products.color = ? AND products.size = ?', [req.params.id, req.query.color, req.query.size])

        // console.log(productData); // obj

        // Get all catagories data from DB
        let getAllCategories = await getData('SELECT * FROM categories', false)

        // console.log(getAllCategories); //array of obj

        // Select data for specific category
        let categoryData = getAllCategories.filter(category => category.id === productData.category)
        categoryData = { ...categoryData[0] }

        // console.log(productData);


        // Get data from DB of all possible color available for selected product
        let productColorOptions = await getData('SELECT products.id, products.color, products.product_group, products.ref, products.size, colors.color_id, colors.color_name, colors.color_hex FROM products JOIN colors ON products.color = colors.color_id WHERE products.product_group = ?', productData.product_group)


        // console.log(productColorOptions);

        // Get array of colors id available for this product in group
        let availableColorsAll = (Array.isArray(productColorOptions)) ? productColorOptions.map(item => item.color) : productColorOptions.color


        // Filter colors id (removing duplicates)
        let availableColors = (Array.isArray(availableColorsAll)) ? availableColorsAll.filter((item, index) => availableColorsAll.indexOf(item) === index) : availableColorsAll

        // Create new array with data to provide as product color options in template
        let colorOptions = (Array.isArray(availableColorsAll)) ? availableColors.map(id => productColorOptions.find(item => item.color === id)) : productColorOptions

        // Get data from DB for all available size options for selected product
        let sizeOptions = await getData('SELECT products.id, products.ref, products.color, products.size, products.product_group, sizes.size_id, sizes.size_name FROM products JOIN sizes ON products.size = sizes.size_id WHERE products.color = ? AND products.product_group = ?', [req.query.color, productData.product_group])

        // Get data from DB for related products
        let relatedProducts = await getData('SELECT * FROM products WHERE products.category = ? AND top = 1 AND primary_item = 1 ORDER BY rating DESC LIMIT 0,4', productData.category)

        // Render template if fetching product data was successful
        if (productData !== undefined) {
            res.render('product', {
                title: productData.title,
                description: productData.meta_description,
                product: productData,
                categories: getAllCategories,
                category: categoryData,
                colors: (Array.isArray(colorOptions)) ? [...colorOptions] : [colorOptions],
                sizes: convertData(sizeOptions),
                thumbs: toArray(productData.images),
                relatedProducts: { relatedProducts }
            })
        } else {
            res.status(404).render('404')
        }
        // Render 404 if query string parameters missing
    } else {
        res.status(404).render('404')
    }

})

module.exports = router