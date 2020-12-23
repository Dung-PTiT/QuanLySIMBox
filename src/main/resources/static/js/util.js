function timeConverter(UNIX_timestamp) {
    let a = new Date(UNIX_timestamp);
    let months = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
    let year = a.getFullYear();
    let month = months[a.getMonth()];
    let date = a.getDate();
    let hour = a.getHours();
    let min = a.getMinutes();
    let sec = a.getSeconds();
    let time = hour + ':' + min + ':' + sec + ' ' + date + '/' + month + '/' + year;
    return time;
//    return new Date(UNIX_timestamp).toISOString().slice(0, 19).replace('T', ' ');
}

function genToastSuccess(message) {
    $.toast({
        text: message,
        icon: 'success',
        showHideTransition: 'plain',
        allowToastClose: true,
        hideAfter: 3000,
        stack: 5,
        position: 'bottom-right',
        textAlign: 'left',
        loader: false,  // Whether to show loader or not. True by default
        loaderBg: '#ffffff',  // Background color of the toast loader
    });
}

function genToastInfo(message) {
    $.toast({
        text: message,
        icon: 'info',
        showHideTransition: 'plain',
        allowToastClose: true,
        hideAfter: 3000,
        stack: 5,
        position: 'bottom-right',
        textAlign: 'left',
        loader: false,  // Whether to show loader or not. True by default
        loaderBg: '#ffffff',  // Background color of the toast loader
    });
}

function genToastError(message) {
    $.toast({
        text: message,
        icon: 'error', // Type of toast icon
        showHideTransition: 'plain', // fade, slide or plain
        allowToastClose: true, // Boolean value true or false
        hideAfter: 3000, // false to make it sticky or number representing the miliseconds as time after which toast needs to be hidden
        stack: 5, // false if there should be only one toast at a time or a number representing the maximum number of toasts to be shown at a time
        position: 'bottom-right', // bottom-left or bottom-right or bottom-center or top-left or top-right or top-center or mid-center or an object representing the left, right, top, bottom values
        textAlign: 'left',  // Text alignment i.e. left, right or center
        loader: false,  // Whether to show loader or not. True by default
        loaderBg: '#ffffff',  // Background color of the toast loader
    });
}
