$(document).ready(function () {
    getAllPost();
});

function getAllPost() {
    $.ajax({
        type: "GET",
        url: "/api/public/post/getAll",
        dataType: "json",
        success: function (data) {
            var postList = data.data;
            var postServiceList = [];
            for (var index in postList) {
                var post = postList[index];
                if (post.category.id == 1 && post.tag.id == 1 && post.active == true) {
                    createAboutUs(postList[index]);
                }
                if (post.category.id == 1 && post.tag.id == 2 && post.active == true && postServiceList.length <= 6) {
                    postServiceList.push(post);
                }
            }
            createOurService(postServiceList);
        }
    });
}

// post.imagePostUrl
// post.title
// post.content


function createAboutUs(post) {
    var divAboutUs =
        ' <div class="col-xs-6 div-image-aboutUS" data-aos="zoom-out">\n' +
        '                <img src="/api/image/upload/' + post.imagePostUrl + '" alt="content" class="img-holder yy" style="max-width: 100%;height: auto;">\n' +
        '            </div>\n' +
        '            <div class="col-xs-6">\n' +
        '                <div class="empty-space height30"></div>\n' +
        '                <div class="flat-accordion style5">\n' +
        '                    <div class="title-accordion" data-aos="fade-right">\n' +
        '                        <span>' + post.title + '</span>\n' +
        '                    </div>\n' +
        '                    <div class="flat-toggle" data-aos="fade-left">\n' +
        '                        <div class="toggle-content">\n' +
        '                            <p>' + post.content + '</p>\n' +
        '                        </div>\n' +
        '                    </div>\n' +
        '                </div>\n' +
        '            </div>';
    $("#about-us").append(divAboutUs);
}

function createOurService(postServiceList) {
    var divServiceStr = '';
    for (var i = 0; i < postServiceList.length; i++) {
        var postService = postServiceList[i];
        var divServiceElement =
            '<div class="col-xs-12 col-sm-6 col-lg-4" data-aos="flip-left">\n' +
            '                        <div class="iconbox images card-service">\n' +
            '                            <div class="box-header div-image-service">\n' +
            '                                <img src="/api/image/upload/' + postService.imagePostUrl + '" alt="icon">\n' +
            '                            </div>\n' +
            '                            <div class="box-content div-content-service">\n' +
            '                                <div class="box-title div-title-service">\n' +
            '                                    <a href="#">' + postService.title + '</a>\n' +
            '                                </div>\n' +
            '                                <p>' + postService.content + '</p>\n' +
            '                                <button class="btn btn-group button-service button-service-text"><h6>Xem thêm<i class="fa fa-chevron-right icon-service"></i></h6>\n' +
            '                                </button>\n' +
            '                            </div>\n' +
            '                        </div>\n' +
            '                    </div>';
        divServiceStr = divServiceStr + divServiceElement;
    }
    $("#our-service").append(divServiceStr);
}
