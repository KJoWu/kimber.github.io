var progress = setInterval(function () {
    var $bar = $("#bar");

    if ($bar.width() >= 600) {
        clearInterval(progress);
    } else {
        $bar.width($bar.width() + 60);
    }
  
}, 800);

$(window).load(function() {
  $("#bar").width(600);
  $(".loader").fadeOut(3000);
});