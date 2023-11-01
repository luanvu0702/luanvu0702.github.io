
const host = "https://cato-diary.000webhostapp.com";

function PostViewModel(post) {
    var self = this;
    self.id = post.id;
    self.content = ko.observable(post.content);
    self.cactus = ko.observable(post.cactus);
    self.tomato = ko.observable(post.tomato);
    self.createdTime = post.createdTime;
    self.user = post.user;
    self.images = post.images;
    self.txtCommentContent = ko.observable("");
    self.comments = ko.observableArray(post.comments);
}

function CaToViewModel() {
    var self = this;
    self.user = {
        userName: "",
        avatar: "",
        fullName: ""
    }
    self.offset = ko.observable(0);
    self.limit = ko.observable(3);
    self.txtEditPostId = ko.observable(null);
    self.txtEditPostContent = ko.observable("");
    self.txtCreatePostContent = ko.observable("");
    self.posts = ko.observableArray([]);
    self.isLoading = ko.observable(false);
    self.isScroll = ko.observable(true);

    self.LoadPosts = async function () {
        if (self.isLoading()) {
            return;
        }
        self.isLoading(true);
        await $.ajax({
            type: "GET",
            data: {
                offset: self.offset(),
                limit: self.limit()
            },
            dataType: "json",
            headers: {
                Authorization: localStorage.getItem("token")
            },
            url: host + "/api/v2/post/select.php",
            success: function (result) {
                if (result.code == 1) {
                    var posts = result.data;
                    if (posts.length > 0) {
                        posts.forEach(function (post) {
                            self.posts.push(new PostViewModel(post))
                        });
                        self.offset(self.offset() + self.limit());
                        self.isScroll(true);
                    } else {
                        self.isScroll(false);
                    }
                    self.isLoading(false);
                } else {
                    // location.href = "/login.html";
                }

            }
        });
    }

    self.ReloadPage = function () {
        location.reload();
    }

    self.CreatePost = async function () {
        const images = dropzone.files.map((x) => x.name).join(';');
        var formData = new FormData();
        formData.append("content", self.txtCreatePostContent());
        formData.append("images", images);
        await $.ajax({
            type: "POST",
            url: host + "/api/v2/post/insert.php",
            data: formData,
            processData: false,
            contentType: false,
            success: function (result) {
                // alert(result.message);
                if (result.code == 1) {
                    UIkit.modal("#create-post").hide();
                    self.posts.unshift(new PostViewModel(result.data));
                }
            }
        });
    }

    self.UpdatePost = async function () {
        if (!confirm("Do you want to update this post?")) {
            return;
        }
        var formData = new FormData();
        formData.append("post_id", self.txtEditPostId());
        formData.append("content", self.txtEditPostContent());
        await $.ajax({
            type: "POST",
            url: host + "/api/v2/post/update.php",
            data: formData,
            processData: false,
            contentType: false,
            success: function (result) {
                alert(result.message);
                if (result.code == 1) {
                    self.ReloadPage();
                }
            }
        });
    }

    self.EditPost = async function (post) {
        UIkit.dropdown("#dropdown-menu-" + post.id).hide(false);
        self.txtEditPostId(post.id);
        self.txtEditPostContent(post.content());
        UIkit.modal("#edit-post").show();
    }

    self.RemovePost = async function (post) {
        UIkit.dropdown("#dropdown-menu-" + post.id).hide(false);
        if (!confirm("Do you want to delete this post?")) {
            return;
        }
        var formData = new FormData();
        formData.append("post_id", post.id);
        await $.ajax({
            type: "POST",
            url: host + "/api/v2/post/delete.php",
            data: formData,
            processData: false,
            contentType: false,
            success: function (result) {
                alert(result.message);
                if (result.code == 1) {
                    self.posts.remove(post);
                }
            }
        });
    }

    self.AddComment = async function (post) {
        if (!post.txtCommentContent())
            return;
        var formData = new FormData();
        formData.append("post_id", post.id);
        formData.append("content", post.txtCommentContent());
        await $.ajax({
            type: "POST",
            url: host + "/api/v2/comment/insert.php",
            data: formData,
            processData: false,
            contentType: false,
            success: function (result) {
                // alert(result.message);
                if (result.code == 1) {
                    post.txtCommentContent("");
                    post.comments.push(result.data);
                }
            }
        });
    }

    self.RemoveComment = async function (post, comment) {
        if (!confirm("Do you want to delete this comment?")) {
            return;
        }
        var formData = new FormData();
        formData.append("comment_id", comment.id);
        await $.ajax({
            type: "POST",
            url: host + "/api/v2/comment/delete.php",
            data: formData,
            processData: false,
            contentType: false,
            success: function (result) {
                alert(result.message);
                if (result.code == 1) {
                    post.comments.remove(comment);
                }
            }
        });
    }

    self.AddCactus = async function (post) {
        var formData = new FormData();
        formData.append("post_id", post.id);
        await $.ajax({
            type: "POST",
            url: host + "/api/v2/post/cactus.php",
            data: formData,
            processData: false,
            contentType: false,
            success: function (result) {
                if (result.code == 1) {
                    post.cactus(result.data);
                }
            }
        });
    }

    self.AddTomato = async function (post) {
        var formData = new FormData();
        formData.append("post_id", post.id);
        await $.ajax({
            type: "POST",
            url: host + "/api/v2/post/tomato.php",
            data: formData,
            processData: false,
            contentType: false,
            success: function (result) {
                if (result.code == 1) {
                    post.tomato(result.data);
                }
            }
        });
    }
    UIkit.util.on('#create-post', 'hide', function () {
        self.txtCreatePostContent("");
        dropzone.removeAllFiles();
    });
    UIkit.util.on('#edit-post', 'hide', function () {
        self.txtEditPostId(null);
        self.txtEditPostContent("");
    });
}
var caToViewModel = new CaToViewModel();
caToViewModel.LoadPosts();
ko.applyBindings(caToViewModel);
function isNearBottomOfPage() {
    var $window = $(window);
    var $document = $(document);

    return $window.scrollTop() + $window.height() > $document.height() - 150;
}

$(window).scroll(function () {
    if (isNearBottomOfPage() && caToViewModel.isScroll()) {
        caToViewModel.LoadPosts();
    }
});