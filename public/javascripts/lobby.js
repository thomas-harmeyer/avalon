window.onload = function () {
    $.ajax({
        method: "GET",
        url: "/night/started",
        success: function (result) {
            if (result) {
                location.href = '/night';
            }
        }
    });
    setInterval(() => $.ajax({
            method: "GET",
            url: "/games/refresh",
            error: function (xhr, status, err) {
                console.log(xhr);
                console.log(status);
                console.log(err);
            },
            success: function (result) {
                if (result != numOfUsers) {
                    location.reload();
                }
            }
        }

    ), 3000);

}