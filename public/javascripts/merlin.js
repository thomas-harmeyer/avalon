window.onload = function () {
    $("#submit").hide();
    $('a').each(function () {
        $(this).click(function () {
            if ($(this).hasClass("btn-secondary")) {
                $(this).removeClass("btn-secondary");
                $(this).addClass("btn-primary");
            } else if ($(this).hasClass("btn-primary")) {
                $(this).removeClass("btn-primary");
                $(this).addClass("btn-secondary");
            }
            $("a.btn-primary").not($(this)).removeClass("btn-primary").addClass("btn-secondary");
            if ($("a.btn-primary").length == 1) {
                $("#submit").show();
            } else {
                $("#submit").hide();
            }
        });
    })
}

function guessMerlin() {
    const guess = $("a.btn-primary").html();
    $.ajax({
        method: "POST",
        url: "/merlin/guess",
        data: {
            guess: guess
        },
        success: function (result) {
            location.reload();
        }
    });
}