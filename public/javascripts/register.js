window.onload = function () {
    $("#submit").prop("disabled", true);

    $("#password").change(() => {
        $("#submit").prop("disabled", confirmPassword());
    })
    $("#confirmPassword").change(() => {
        $("#submit").prop("disabled", confirmPassword());
    })
}

function confirmPassword() {
    return !($("#password").val() == $("#confirmPassword").val() && $("#password").val() != "" && $("#username").val() != "");
}