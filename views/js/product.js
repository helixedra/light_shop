$(document).ready(function () {

    // Product Images Viewer
    $('.thumbs-img > img').click(function () {
        if ($(this).attr('class') !== 'thumb-active') {
            $('.big-img > img').attr('src', '' + $(this).attr('src') + '')
            $('.thumb-active').attr('class', '')
            $(this).attr('class', 'thumb-active')
        }
    })

    // Active highlight for color options
    let currentColor = $('.color-options').attr('data-current-color')
    $('.color-options > a').each(function () {
        if ($(this).attr('data-color-id') === currentColor) {
            $(this).attr('class', 'color-active')
        }
    })

    $(function () {
        $('[data-toggle="tooltip"]').tooltip()
    })

})