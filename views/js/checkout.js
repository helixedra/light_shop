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
    // cartCounter()
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




let dataItems = getCartItemsIdLS()

function checkoutTotal() {
    setTimeout(() => {
        let delivery = +$('#deliveryPrice').val()
        let itemsTotal = $('.checkout-cart > .item')
        let total = 0
        itemsTotal.each(function () {
            total += +$(this).attr('data-item-sum')
        })
        $('#checkoutTotal').html(numFormat(total) + ' ₴')
        $('#checkoutTotalEnd').html(numFormat(total + delivery) + ' ₴')
        $('input[name=order]').val(createOrder())
        $('input[name=total]').val(total + delivery)
    }, 100)

}

//Count quantity
function countQty() {
    let cart = getCartLS()
    let counter = 0
    if (cart) {
        cart.map(item => {
            counter += parseInt(item.q)
        })
        $('#total-qty').html(counter)

    } else {
        $('#total-qty').html(0)
    }
}

/********************** <-- RADIO BUTTONS ***********************/
$(document).ready(function () {
    // Radio buttons select
    $('.radio-select').click(function () {
        activeRadio($(this))
    })

    $('#loginModal').click(function (event) {
        event.preventDefault();
    })

    getCheckoutCart(dataItems)
    checkoutTotal()
    countQty()
    delivery()
})

function delivery(option) {
    if (option === 3) {
        $('#deliveryPrice').val(500)
        $('#deliveryPriceBlock').text('500')
        $('input[name=delivery_opt_id]').val(3)
        checkoutTotal()
    } else if (option === 2) {
        $('#deliveryPrice').val(350)
        $('#deliveryPriceBlock').text('350')
        $('input[name=delivery_opt_id]').val(2)
        checkoutTotal()
    } else {
        $('#deliveryPrice').val(0)
        $('#deliveryPriceBlock').text('0')
        $('input[name=delivery_opt_id]').val(1)
        checkoutTotal()
    }

}


function contentBlock(element, block) {
    //If this block has content
    if (element.parent().has('div.selected-content').length) {
        //Hide all blocks
        $('.' + block + ' > .selected-content').addClass('none')
        //Then show selected
        element.parent().children('.selected-content').removeClass('none')
    }
}
function activeRadio(element) {
    //Get name of controls block
    let block = element.parent().attr('class')

    if (block === 'delivery-option') {
        delivery(element.parent().data('delivery-option-id'))
    }

    //Remove active status from all elements of block 
    $('.' + block + '> .radio-select > i').removeClass().addClass('far fa-circle')
    $('.' + block + '> .radio-select').removeClass('radio-active')
    //Add active status to selected item
    element.addClass('radio-active')
    element.children('i').attr('class', 'far fa-check-circle')
    contentBlock(element, block)
    let optionName = element.parent().attr('class')
    $('input[name=' + optionName.replace('-', '_') + ']').val(element.data(optionName))
}
/********************** RADIO BUTTONS --> ***********************/


// GET AND LOOP ITEMS IN CART
function checkoutCartItems(data) {
    // Pass 'data' from DB
    // Loop through 'data' and generate html items for cart
    let output = data.map(value => {
        return `<div class="item d-flex align-items-center justify-content-between" id="item-${value.id}" data-item-sum="${(currentItemQty(value.id) * value.price)}">
        <a href="/products/p/${value.uri}">
        <img src="/images/products/${value.uri}/${value.cover_img}" class="item-img" alt="${value.title}">
        </a>
        <div class="item-info" data-pid="${value.id}">
            <div class="item-title">
                <a href="/products/p/${value.uri}" class="reset-link">${value.title}</a>
            </div>
            <div class="item-code">Код товара: <span>${value.id}</span></div>
        </div>
        <div class="item-price" data-price="${value.price}">${numFormat(value.price)} ₴</div>
        <div class="item-qty" data-item="${value.id}" data-qty="${currentItemQty(value.id)}">
         <button type="button" class="reset-btn minusqty" data-item="${value.id}"><i class="far fa-minus"></i></button>
            <input type="number" data-item="${value.id}" data-price="${value.price}" value="${currentItemQty(value.id)}" class="reset-btn qty">
             <button type="button" class="reset-btn plusqty" data-item="${value.id}"><i class="far fa-plus"></i></button>
        </div>
        <div class="item-sum-price sum-price" data-item="${value.id}">${numFormat(currentItemQty(value.id) * value.price)} ₴</div>
        <button type="button" class="item-delete reset-btn" data-item="${value.id}"><i class="far fa-times"></i></button>
        <input type="hidden" name="pid" value="${value.id}">
        <input type="hidden" name="item_title" value="${value.title}">
        <input type="hidden" data-qty-item="${value.id}" name="qty" value="${currentItemQty(value.id)}">
        <input type="hidden" name="item_price" value="${value.price}">
    </div>`
    }).join('')

    return output
    /* >>> Return html for cart items */
}

function getCheckoutCart(data) {
    $.ajax({
        url: "/cart/getcart",
        type: "POST",
        dataType: "json",
        data: data,
        success: function (result) {
            let items = $.parseHTML(checkoutCartItems(result))
            $('.checkout-cart').html(items)
            // checkoutTotal()
        }
    })

}



// ----- PRICE FORMAT -----
function numFormat(num) {
    return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1 ")
}
// -----------------------



// --- PLUS BUTTON ---
$('body').on('click', '.plusqty', function () {
    let id = $(this).attr('data-item')
    let price = $('.qty[data-item="' + id + '"]').attr('data-price')
    let qty = $('.qty[data-item="' + id + '"]')
    if (qty.val() <= 99) {
        qty.val(parseInt(qty.val()) + 1)
        let sum = numFormat((qty.val() * price))
        $('.sum-price[data-item="' + id + '"]').html(sum + " ₴")
        $('.item-qty[data-item="' + id + '"]').attr('data-qty', qty.val());
        $('input[data-qty-item="' + id + '"]').val(qty.val()); ///----
        $('#item-' + id).attr('data-item-sum', qty.val() * price);
        updateQuantity(id, qty.val())
        countQty()
        checkoutTotal()
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
        $('.item-qty[data-item="' + id + '"]').attr('data-qty', qty.val());
        $('input[data-qty-item="' + id + '"]').val(qty.val()); ///----
        $('#item-' + id).attr('data-item-sum', qty.val() * price);
        updateQuantity(id, qty.val())
        countQty()
        checkoutTotal()
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
        $('.item-qty[data-item="' + id + '"]').attr('data-qty', qty);
        $('input[data-qty-item="' + id + '"]').val(qty); ///----
        $('#item-' + id).attr('data-item-sum', qty * price);
        updateQuantity(id, qty)
        countQty()
        checkoutTotal()
    }

})
// ---

// --- DELETE ITEM BUTTON ---
$('body').on('click', '.item-delete', function () {
    let id = $(this).attr('data-item')
    $('#item-' + id).remove()
    removeCartItemsLS(id)
    isCartEmpty()
    // totalLast()
    // cartCounter()
    setStatus(getCartItemsIdLS())
    checkoutTotal()
})
// ---

function createOrder() {
    let cartItems = $('.checkout-cart > .item')
    let order = []
    cartItems.each(function () {
        order.push(`pid=${$(this).children('.item-info').data('pid')};qty=${$(this).children('.item-qty').data('qty')};price=${$(this).children('.item-price').data('price')}`)
    })
    return order
}


//     // Checkout cart


//     let dataItems = getCartItemsIdLS()
//     // GET AND LOOP ITEMS IN CART
//     function checkoutCartItems(data) {
//         // Pass 'data' from DB
//         // Loop through 'data' and generate html items for cart
//         let output = data.map(value => {
//             //     return `<div class="item d-flex align-items-center justify-content-between" id="item-${value.id}" data-item-sum="${(currentItemQty(value.id) * value.price)}">
//             //     <a href="/products/p/${value.uri}">
//             //     <img src="/images/products/${value.uri}/${value.cover_img}" class="item-img" alt="${value.title}">
//             //     </a>
//             //     <div class="item-info" data-pid="${value.id}">
//             //         <div class="item-title">
//             //             <a href="/products/p/${value.uri}" class="reset-link">${value.title}</a>
//             //         </div>
//             //         <div class="item-code">Код товара: <span>${value.id}</span></div>
//             //     </div>
//             //     <div class="item-price" data-price="${value.price}">${numFormat(value.price)} ₴</div>
//             //     <div class="item-qty" data-qty="${currentItemQty(value.id)}">
//             //     ${currentItemQty(value.id)}
//             //         <input type="hidden" data-item="${value.id}" data-price="${value.price}" value="${currentItemQty(value.id)}">

//             //     </div>
//             //     <div class="item-sum-price sum-price" data-item="${value.id}">${numFormat(currentItemQty(value.id) * value.price)} ₴</div>

//             // </div>`

//             return `<div class="item d-flex align-items-center justify-content-between" id="item-${value.id}" data-item-sum="${(currentItemQty(value.id) * value.price)}">
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
//         <div class="item-qty" data-qty="${currentItemQty(value.id)}">

//             <input type="number" data-item="${value.id}" data-price="${value.price}" value="${currentItemQty(value.id)}" class="reset-btn qty" readonly>

//         </div>
//         <div class="item-sum-price sum-price" data-item="${value.id}">${numFormat(currentItemQty(value.id) * value.price)} ₴</div>

//     </div>`
//         }).join('')

//         return output
//         /* >>> Return html for cart items */
//     }

//     function createOrder() {
//         let cartItems = $('.checkout-cart > .item')
//         let order = []
//         cartItems.each(function () {
//             order.push(`pid=${$(this).children('.item-info').data('pid')};qty=${$(this).children('.item-qty').data('qty')};price=${$(this).children('.item-price').data('price')}`)
//         })
//         return order
//     }

//     function checkoutTotal() {
//         let itemsTotal = $('.checkout-cart > .item')
//         let total = 0
//         itemsTotal.each(function () {
//             total += $(this).data('item-sum')
//         })

//         $('.checkout-total-sum').html(numFormat(total) + ' ₴')
//         $('input[name=order]').val(createOrder())
//         $('input[name=total]').val(total)
//     }

//     function getCheckoutCart(data) {
//         $.ajax({
//             url: "/cart/getcart",
//             type: "POST",
//             dataType: "json",
//             data: data,
//             success: function (result) {
//                 let items = $.parseHTML(checkoutCartItems(result))
//                 $('.checkout-cart').html(items)
//                 checkoutTotal()
//             }
//         })

//     }



//     // getCheckoutCart(dataItems)

//     // 
//     getCheckoutCart(dataItems)
//     // getCheckoutCart(dataItems)

// })

