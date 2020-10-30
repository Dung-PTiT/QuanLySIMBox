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
            var postKeyBenefitList = [];
            var postFeatureList = [];
            for (var index in postList) {
                var post = postList[index];
                if (post.category.id == 2 && post.tag.id == 8 && post.active == true) {
                    createProductOverview(postList[index]);
                }
                if (post.category.id == 2 && post.tag.id == 9 && post.active == true && postKeyBenefitList.length <= 4) {
                    postKeyBenefitList.push(post);
                }
                if (post.category.id == 2 && post.tag.id == 10 && post.active == true && postFeatureList.length <= 3) {
                    postFeatureList.push(post);
                }
            }
            createKeyBenefit(postKeyBenefitList);
            createFeature(postFeatureList);
        }
    });
}

// post.imagePostUrl
// post.title
// post.content


function createProductOverview(post) {
    var divProductOverview =
        ' <div class="col-12 col-sm-6 col-md-6 col-lg-6" data-aos="fade-right">\n' +
        '                    <h1 class="text-danger">' + post.title + '</h1>\n' +
        '                    <br><br>\n' +
        '                    <span style="margin-top: 21px;">' + post.content + '</span>\n' +
        '                </div>\n' +
        '                <div class="col-12 col-sm-6 col-md-6 col-lg-6" data-aos="zoom-in-left" style="text-align: center;">\n' +
        '                    <img src="/api/image/upload/' + post.imagePostUrl + '"/>\n' +
        '                </div>';
    $("#productOverview").append(divProductOverview);
}

function createKeyBenefit(postKeyList) {
    var divKeyBenefitStr = '';
    for (var i = 0; i < postKeyList.length; i++) {
        var post = postKeyList[i];
        var divElement =
            '<div class="col-md-6" style="margin-top: 30px">\n' +
            '                    <div class="row">\n' +
            '                        <div class="col-md-3" style="text-align: center;" data-aos="flip-down">\n' +
            '                            <img src="/api/image/upload/' + post.imagePostUrl + '" atl="slider-image"/>\n' +
            '                        </div>\n' +
            '                        <div class="col-md-9">\n' +
            '                            <h2 style="color: #000000" data-aos="fade-down-right">' + post.title + '</h2>\n' +
            '                            <br>\n' +
            '                            <h6 data-aos="fade-down-left">' + post.content + '</h6>\n' +
            '                        </div>\n' +
            '                    </div>\n' +
            '                </div>';
        divKeyBenefitStr = divKeyBenefitStr + divElement;
    }
    $("#keyBenefit").append(divKeyBenefitStr);
}


function createFeature(postFeatureList) {
    var divFeatureStr = '';
    for (var i = 0; i < postFeatureList.length; i++) {
        var post = postFeatureList[i];
        var dataAOS = '';
        if (i == 0) {
            dataAOS = 'data-aos="zoom-in-right"';
        }
        if (i == 1) {
            dataAOS = 'data-aos="fade-up"\n' +
                '     data-aos-anchor-placement="top-bottom"';
        }
        if (i == 2) {
            dataAOS = 'data-aos="zoom-in-left"';
        }
        var divElement =
            '<div class="col-xs-12 col-md-4" ' + dataAOS + '>\n' +
            '                    <div class="iconbox images card-feature">\n' +
            '                        <div class="div-image">\n' +
            '                            <img src="/api/image/upload/' + post.imagePostUrl + '" alt="icon"\n' +
            '                                 class="img-holder">\n' +
            '                        </div>\n' +
            '                        <div class="box-content div-content-service">\n' +
            '                            <div class="box-title div-title-service">\n' +
            '                                <span>' + post.title + '</span>\n' +
            '                            </div>\n' +
            '                            <p>' + post.content + '</p>\n' +
            '                        </div>\n' +
            '                    </div>\n' +
            '                </div>';
        divFeatureStr = divFeatureStr + divElement;
    }
    $("#featureDiv").append(divFeatureStr);
}
