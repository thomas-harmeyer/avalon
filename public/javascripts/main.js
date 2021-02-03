document.onload = () => $('a').each(function () {
    $(this).click(function () {
        if ($(this).hasClass("btn-secondary")) {
            $(this).removeClass("btn-secondary");
            $(this).addClass("btn-primary");
        } else if ($(this).hasClass("btn-primary")) {
            $(this).removeClass("btn-primary");
            $(this).addClass("btn-secondary");
        }
    });
});