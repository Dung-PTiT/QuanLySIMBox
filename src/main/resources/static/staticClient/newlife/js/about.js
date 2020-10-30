function initMap() {
    var map = new google.maps.Map(document.getElementById('address_company_map'), {
        zoom: 17,
        center: {lat: 21.020309, lng: 105.826360},
        disableDefaultUI: true,
        fullscreenControl: true,
        zoomControl: true
    });

    var data = 'Số 5, 33/189 Ô Chợ Dừa, Đống Đa, Hà Nội';
    var infowindow = new google.maps.InfoWindow({
        content: data
    });

    var marker = new google.maps.Marker({
        position: new google.maps.LatLng(21.020309, 105.826360),
        title: 'Số 5, 33/189 Ô Chợ Dừa, Đống Đa, Hà Nội',
        map: map
    });

    google.maps.event.addListener(marker, 'click', function () {
        infowindow.open(map, marker);
    });
}

function sendMessage() {
    var name = $("#name").val();
    var email = $("#email").val();
    var phoneNumber = $("#phoneNumber").val();
    var message = $("#message").val();
    console.log(name + ' ' + email + ' ' + phoneNumber + ' ' + message);
    $.ajax({
        type: "POST",
        url: "/api/public/message/create",
        dataType: "json",
        data: {
            "name": name,
            "email": email,
            "phoneNumber": phoneNumber,
            "message": message
        },
        success: function (data) {
            swal("OK", data.data, "success");
        }
    });
}