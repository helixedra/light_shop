$(document).ready(function () {

    $(document).click(function (e) {
        let hClick = $(e.target).hasClass('dropdown-menu')
        if (!hClick) {
            $('.search-dropdown').removeClass('show')
        } $('ul.nav li.dropdown').hover(function () {
            $(this).find('.dropdown-menu').stop(true, true).delay(200).fadeIn(500);
        }, function () {
            $(this).find('.dropdown-menu').stop(true, true).delay(200).fadeOut(500);
        });
    })

    //Search watch
    $('#search').keyup(function () {
        // e.preventDefault()
        let word = $(this).val()
        if (word.length > 1) {
            $.ajax({
                url: '/search',
                type: 'POST',
                // dataType: 'json',
                data: { 'search': word },
                success: function (result) {
                    if (result.length > 1) {
                        $('.search-dropdown').html(searchList(result)).addClass('show')
                        $('.search-dropdown > a > span').each(function (index, element) {
                            let found = $(element).html()
                            let regex = new RegExp("(" + word + ")", "gi");
                            let foundWord = regex.exec(found)
                            let modFound = found.replace(regex, '<b>' + foundWord[0] + '</b>')
                            $(element).html(modFound)
                        })
                    } else {
                        $('.search-dropdown').html('<div class="search-not-found">Ничего не найдено</div>').addClass('show')
                    }
                }
            })
        } else {
            $('.search-dropdown').removeClass('show')
        }

    })

    function searchList(data) {
        let list = data.map(value => {
            return `<a href="/products/p/${value.id}?ref=${value.ref}&color=${value.color}&size=${value.size}" class="search-found-item">
            <span>${value.title}</span></a>`
        }).join('')
        return list
    }


})

$('#catalog-menu-container').hover(function () {
    $(this).find('#catalog-menu').stop(true, true).delay(10).fadeIn(500);
}, function () {
    $(this).find('#catalog-menu').stop(true, true).delay(100).fadeOut(500);
});