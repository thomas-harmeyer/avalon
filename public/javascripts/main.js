function setTimer() {
    const currentDate = new Date();
    if (endTime > currentDate) {
        let relativeTime = new Date(endTime - currentDate.getTime());
        let mins = relativeTime.getMinutes();
        let secs = relativeTime.getSeconds();
        if (secs.toString().length < 2) {
            secs = "0" + secs;
        }
        $("#timer").html(mins + ":" + secs);
    } else {
        $("#timer").html("Game Is Over!");
    }
}
window.onload = function () {
    $("#error").hide();
    console.log(state);
    setTimer();
    setInterval(setTimer, 1000);
    $('a').each(function () {
        $(this).click(function () {
            if ($(this).hasClass("btn-secondary")) {
                $(this).removeClass("btn-secondary");
                $(this).addClass("btn-primary");
            } else if ($(this).hasClass("btn-primary")) {
                $(this).removeClass("btn-primary");
                $(this).addClass("btn-secondary");
            }
        });
    })
    $("#submit").click(() => {
        let suggestedUsers = {
            "users": []
        };
        $("a.btn-primary").each((index, value) => {
            suggestedUsers.users.push($(value).text());
        });
        $("a.btn-primary").removeClass("btn-primary").addClass("btn-secondary");
        if (suggestedUsers.users.length == numOfPeopleOnMission && suggestedUsers.users.length != 0) {
            $.ajax({
                method: "POST",
                url: "/main/new_mission",
                data: suggestedUsers,
                success: function (result) {
                    location.reload();
                }
            });
            $('body').hide();
        } else {
            $("#error").show();
        }
    });
    setInterval(() => $.ajax({
            method: "GET",
            url: "/main/state",
            error: function (xhr, status, err) {
                console.log(xhr);
                console.log(status);
                console.log(err);
            },
            success: function (result) {
                if (result != state) {
                    location.reload();
                }
            }
        }

    ), 3000);
};