const host = "http://cato-diary.byethost4.com";
function CaToLoginViewModel() {
    var self = this;
    self.username = ko.observable("");
    self.password = ko.observable("");

    self.login = function () {
        var formData = new FormData();
        formData.append("username", self.username());
        formData.append("password", self.password());
        $.ajax({
            type: "POST",
            url: host + "/api/v2/login.php",
            data: formData,
            processData: false,
            contentType: false,
            success: function (result) {
                if (result.code == 1) {
                    localStorage.setItem("token", JSON.stringify(result.data.token));
                    // location.href = "/index.html";
                } else {
                    alert(result.message);
                }
            }
        });
    }
}
var caToLoginViewModel = new CaToLoginViewModel();
ko.applyBindings(caToLoginViewModel);