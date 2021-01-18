
function checkForStart() {
    $.ajax({
        method: "GET",
        url: "/night/started",
        success: function (result) {
           location.href = '/night';
        }
    });
}