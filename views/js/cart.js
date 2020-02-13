// **************** CART LOGIC ****************

// GET CART (ITEMS IDs) FROM LOCAL STORAGE

function getCartItemsIdLS() {

    // Check if user logged 
    // ...
    // Get data for specific user 
    // ...

    // Get data for guest

    let cart = JSON.parse(localStorage.getItem('cart-guest'))
    let items = {}

    if (cart !== null) {

        cart.forEach((item, index) => {
            items[index] = item.p
        })

    } else {

        items = false

    }

    return items

    // >>> Return obj with items id or 'false' if cart is empty
}
// *******************************************


// GET QUANTITY BY ID FROM LOCAL STORAGE
function currentItemQty(id) {

    // Check if user logged 
    // ...
    // Get data for specific user 
    // ...

    // Get data for guest

    let cart = JSON.parse(localStorage.getItem('cart-guest'))

    let obj = cart.find(item => {

        if (item.p === id) {
            return item.q
        }

    })

    return obj.q

    // >>> Return QUANTITY for requested ID

}
// *******************************************

// GET AND LOOP ITEMS IN CART
function cartItems(data) {
    // Pass 'data' from DB
    // Loop through 'data' and generate html items for cart
    let output = data.map(value => {
        return `<div class="item d-flex align-items-center justify-content-between" id="item-${value.id}">
                <a href="/products/p/${value.uri}">
                <img src="/images/products/${value.uri}/${value.cover_img}" class="item-img" alt="${value.title}">
                </a>
                <div class="item-info">
                    <div class="item-title">
                        <a href="/products/p/${value.uri}" class="reset-link">${value.title}</a>
                    </div>
                    <div class="item-code">Код товара: <span>${value.id}</span></div>
                </div>
                <div class="item-price">${numFormat(value.price)} ₴</div>
                <div class="item-qty">
                    <button class="reset-btn minusqty" data-item="${value.id}"><i class="far fa-minus"></i></button>
                    <input type="number" data-item="${value.id}" data-price="${value.price}" value="${currentItemQty(value.id)}" class="reset-btn qty">
                    <button class="reset-btn plusqty" data-item="${value.id}"><i class="far fa-plus"></i></button>
                </div>
                <div class="item-sum-price sum-price" data-item="${value.id}">${numFormat(currentItemQty(value.id) * value.price)} ₴</div>
                <button class="item-delete reset-btn" data-item="${value.id}"><i class="far fa-times"></i></button>
            </div>`
    }).join('')

    return output
    /* >>> Return html for cart items */
}

// *******************************************

function updateCart() {

    let items = getCartItemsIdLS() // get obj with ids only from local storage
    if (items) {
        $('.cart-bottom').removeClass('none')
        getCart(items)
        setStatus(items)
    } else {
        $('.cart-empty').show()
        $('.cart-bottom').addClass('none')
        setStatus(items)
    }


}




// *** GET DATA FOR ITEMS IN CART FROM DB
function getCart(data) {
    $.ajax({
        url: "/cart/getcart",
        type: "POST",
        dataType: "json",
        data: data,
        success: function (result) {
            let items = $.parseHTML(cartItems(result))
            $('#cart-items').html(items)
        }
    })
}

function setStatus(items) {
    if (items) {
        $('.add-to-cart').each(function () {
            let id = parseInt($(this).attr('data-id'))
            let item = Object.values(items).indexOf(id)

            if (item !== -1) {
                $(this).addClass('added-to-cart').html('Добавлен в корзину')
            } else {
                $(this).removeClass('added-to-cart').htm('<i class="fal fa-shopping-cart"></i> Купить')
            }

        })
    } else {
        $('.add-to-cart').each(function () {
            $(this).removeClass('added-to-cart').html('<i class="fal fa-shopping-cart"></i> Купить')
        })
    }
}

// ******** REMOVE ITEM FROM LOCAL STORAGE BY ID *********
function removeCartItemsLS(id) {
    let cart = getCartLS()
    if (cart) {

        let index = cart.findIndex(item => item.p === parseInt(id))

        if (index >= 0) {
            cart.splice(index, 1)
        }
        if (cart.length === 0) {
            cart = false
        }
    }

    saveCartToLS(cart)
    cartCounter()
    updateCart()
}

// --- SAVE CART TO LOCAL STORAGE ---
function saveCartToLS(data) {

    // If data pass 'false' local storage will be removed

    if (data) {
        // Check if user logged 
        // ...

        // Save cart for guest
        localStorage.setItem('cart-guest', JSON.stringify(data))
    } else {
        // Check if user logged 
        // ...

        // Remove cart for guest
        localStorage.removeItem('cart-guest')
    }

}
// ----------------------------------


// ----- UPDATE QUANTIRY IN LOCAL STORAGE -----

function updateQuantity(id, value) {

    let cart = getCartLS()

    cart.map(item => {
        if (item.p === parseInt(id)) {

            item.q = value
        }
    })

    saveCartToLS(cart)
}

// ----------------------------------------


// --- GET DATA FROM LOCAL STORAGE ---

function getCartLS() {

    let cart = {}

    // Registred user storage
    // ...

    // Guest user storage
    cart = JSON.parse(localStorage.getItem('cart-guest'))

    // Check in its not empty
    if (cart === undefined || cart === null || cart === '') {
        cart = false
    }

    // >>> Return data from local storage

    return cart
}

// -----------------------------------

// ------- GET TOTAL PRICE -------
function total() {
    let total = 0
    $('#cart-items > .item > .item-qty > .qty').each(function () {
        total += parseInt($(this).attr('data-price')) * parseInt($(this).val())
    })
    $('#total').html(numFormat(total) + " ₴")
    $('#total').attr('data-total', '' + total + '')

    if (isCheckout()) {
        $('.checkout-total-sum').html(numFormat(total) + ' ₴')
        $('input[name=order]').val(createOrder())
        $('input[name=total]').val(total)
        countQty()
        checkoutTotal()
    }
}
// ----

// ---- GET TOTAL WITH TIMEOUT
function totalLast() {
    $('#cart-spinner').show()
    setTimeout(() => {
        $('#cart-spinner').hide()
        total()
    }, 500)
}
// ----

// ------ GET CART COUNTER ------
function cartCounter() {
    // check if user registred and get user id 
    // get user cart from local storage

    // get cart for guest
    let cart = getCartLS()
    let counter = 0
    if (cart) {
        cart.map(item => {
            counter += parseInt(item.q)
        })
        $('.cart-counter').html(': ' + counter).show()
    } else {
        $('.cart-counter').html(counter).hide()
    }

    // -------------------------------------

}

/* CHECK IF CART EMPTY AND SHOW EMPTY STATE */
function isCartEmpty() {
    if (!getCartItemsIdLS()) { // if local storage empty return false 
        $('#cart-items').html('<div class="cart-empty">Корзина пуста</div>')
        if (isCheckout()) $('.checkout-cart').html('')
    }
}

// ----- PRICE FORMAT -----
function numFormat(num) {
    return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1 ")
}
// -----------------------

// CHANGE PRICE FORMAT GLOBAL
$('.price > div').each((index, element) => {
    $(element).text(numFormat($(element).text()))
})


// $('.price > div').text(numFormat($(this).text()))

// ----- ADD TO CART -----
$('.add-to-cart-s, .add-to-cart').click(function () {

    let id = $(this).data('id')
    // let color = $(this).data('color')
    // let size = $(this).data('size')
    // add id to cart for registred users 
    let cart = getCartLS()

    if (cart) {

        let findSameItem = cart.findIndex(item => item.p === parseInt(id))

        // console.log(findSameItem);

        if (findSameItem !== -1) {

            // cart[foundIndex].q = parseInt(cart[foundIndex].q) + 1

            // If the same item has already in the cart just do nothing

        } else {

            //If it's not - push new to array
            let newItem = { "p": id, "q": 1 }
            cart.push(newItem)
        }

        // Save new cart array to localStorage
        localStorage.setItem('cart-guest', JSON.stringify(cart))
        setStatus(getCartItemsIdLS())

    } else {

        localStorage.setItem('cart-guest', `[{"p":${id}, "q":1 }]`)

    }

    cartCounter()
    updateCart()
    totalLast()
    $('.cart-empty').hide()
    $('#cartModal').modal('show')
})

// ---


// --- PLUS BUTTON ---
$('body').on('click', '.plusqty', function () {
    let id = $(this).attr('data-item')
    let price = $('.qty[data-item="' + id + '"]').attr('data-price')
    let qty = $('.qty[data-item="' + id + '"]')
    if (qty.val() <= 99) {
        qty.val(parseInt(qty.val()) + 1)
        let sum = numFormat((qty.val() * price))
        $('.sum-price[data-item="' + id + '"]').html(sum + " ₴")
        totalLast()
        updateQuantity(id, qty.val())
        cartCounter()
    }
});
// ---

// --- MINUS BUTTON ---
$('body').on('click', '.minusqty', function () {
    let id = $(this).attr('data-item')
    let price = $('.qty[data-item="' + id + '"]').attr('data-price')
    let qty = $('.qty[data-item="' + id + '"]')
    if (qty.val() > 1) {
        qty.val(parseInt(qty.val()) - 1)
        let sum = numFormat(qty.val() * price)
        $('.sum-price[data-item="' + id + '"]').html(sum + " ₴")
        // $('.sum-price[data-item="' + id + '"]').html(sum + " ₴")
        totalLast()
        updateQuantity(id, qty.val())
        cartCounter()
    }
})
// ---

// --- INPUT CHANGE EVENT ---
$('body').on('change', '.qty', function () {

    let qty = $(this).val()

    if (qty === '' || qty === '0') {
        run(1, $(this))
    } else {
        run(qty, $(this))
    }

    function run(qty, scope) {
        scope.val(qty)
        let price = scope.attr('data-price')
        let id = scope.attr('data-item')
        let sum = numFormat(qty * price)
        $('.sum-price[data-item="' + id + '"]').html(sum + " ₴")
        totalLast()
        updateQuantity(id, qty)
        cartCounter()
    }

})
// ---

// --- DELETE ITEM BUTTON ---
$('body').on('click', '.item-delete', function () {
    let id = $(this).attr('data-item')
    $('#item-' + id).remove()
    removeCartItemsLS(id)
    isCartEmpty()
    totalLast()
    cartCounter()
    setStatus(getCartItemsIdLS())
})
// ---

// --- BASIC CALLS ----
getCartItemsIdLS()
cartCounter()
updateCart()
// ---

// --- GET TOTAL AFTER ALL
totalLast()




// function isCheckout() {
//     return $('.checkout-cart').length ? true : false
// }

let dataItems = getCartItemsIdLS()
// GET AND LOOP ITEMS IN CART
// function checkoutCartItems(data) {
//     // Pass 'data' from DB
//     // Loop through 'data' and generate html items for cart
//     let output = data.map(value => {
//         return `<div class="item d-flex align-items-center justify-content-between" id="item-${value.id}" data-item-sum="${(currentItemQty(value.id) * value.price)}">
//         <a href="/products/p/${value.uri}">
//         <img src="/images/products/${value.uri}/${value.cover_img}" class="item-img" alt="${value.title}">
//         </a>
//         <div class="item-info" data-pid="${value.id}">
//             <div class="item-title">
//                 <a href="/products/p/${value.uri}" class="reset-link">${value.title}</a>
//             </div>
//             <div class="item-code">Код товара: <span>${value.id}</span></div>
//         </div>
//         <div class="item-price" data-price="${value.price}">${numFormat(value.price)} ₴</div>
//         <div class="item-qty" data-item="${value.id}" data-qty="${currentItemQty(value.id)}">
//          <button class="reset-btn minusqty" data-item="${value.id}"><i class="far fa-minus"></i></button>
//             <input type="number" data-item="${value.id}" data-price="${value.price}" value="${currentItemQty(value.id)}" size="3">
//              <button class="reset-btn plusqty" data-item="${value.id}"><i class="far fa-plus"></i></button>
//         </div>
//         <div class="item-sum-price sum-price" data-item="${value.id}">${numFormat(currentItemQty(value.id) * value.price)} ₴</div>
//         <button class="item-delete reset-btn" data-item="${value.id}"><i class="far fa-times"></i></button>
//     </div>`
//     }).join('')

//     return output
/* >>> Return html for cart items */
// }

// function createOrder() {
//     let cartItems = $('.checkout-cart > .item')
//     let order = []
//     cartItems.each(function () {
//         order.push(`pid=${$(this).children('.item-info').data('pid')};qty=${$(this).children('.item-qty').data('qty')};price=${$(this).children('.item-price').data('price')}`)
//     })
//     return order
// }

// function checkoutTotal() {
//     let delivery = 350
//     let itemsTotal = $('.checkout-cart > .item')
//     // console.log(itemsTotal)
//     let total = 0
//     itemsTotal.each(function () {
//         total += $(this).data('item-sum')
//     })
//     // console.log(total)
//     $('#checkoutTotal').html(numFormat(total) + ' ₴')
//     $('#checkoutTotalEnd').html(numFormat(total + delivery) + ' ₴')
//     // $('.item[data-item="' + id + '"]').data('item-sum', sum)
// }

// function getCheckoutCart(data) {
//     $.ajax({
//         url: "/cart/getcart",
//         type: "POST",
//         dataType: "json",
//         data: data,
//         success: function (result) {
//             let items = $.parseHTML(checkoutCartItems(result))
//             $('.checkout-cart').html(items)
//             checkoutTotal()
//         }
//     })

// }

