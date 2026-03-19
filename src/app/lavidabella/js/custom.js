var current_fs, next_fs, previous_fs;
var left, opacity, scale;
var animating;

$(".next").click(function () {
    if (animating) return false;
    animating = true;
    current_fs = $(this).parent();
    next_fs = $(this).parent().next();
    //$("#progressbar li").eq($("fieldset").index(next_fs)).addClass("active");
    next_fs.show();
    current_fs.animate({ opacity: 0 }, {
        step: function (now, mx) {
            left = (now * 50) + "%";
            opacity = 1 - now;
            current_fs.css({ 'transform': 'scale(' + scale + ')' });
            next_fs.css({ 'left': left, 'opacity': opacity });
        },
        duration: 800,
        complete: function () {
            current_fs.hide();
            animating = false;
        },
        easing: 'easeInOutBack'
    });
});

$(".title_div").click(function () {
    $('.content_div').slideUp("easeOutCirc");
    $('.title_div').removeClass('title_divactive');
    if ($(this).next().is(":visible")) {
        $(this).next().slideUp("easeOutCirc");
    } else {
        $(this).next().slideDown("easeOutCirc");
        $(this).addClass('title_divactive');
        $('.title_divsub').removeClass('title_divsubactive');
        $('.content_divsub').slideUp("easeOutCirc");
    }
});
$(".title_divsub").click(function () {
    $('.content_divsub').slideUp("easeOutCirc");
    $('.title_divsub').removeClass('title_divsubactive');
    if ($(this).next().is(":visible")) {
        $(this).next().slideUp("easeOutCirc");
    } else {
        $(this).next().slideDown("easeOutCirc");
        $(this).addClass('title_divsubactive');
    }
});

//$('.count').each(function () {
//    $(this).prop('Counter',0).animate({
//        Counter: $(this).text()
//    }, {
//        duration: 4000,
//        easing: 'swing',
//        step: function (now) {
//            $(this).text(Math.ceil(now));
//        }
//    });
//});

$('#city').change(function () {
    if ($(this).find('option:selected').val() == "Other") {
        $(".othertcitylocality").show();
        $('#locality').attr('disabled', true);
        $('#othercity, #otherlocality').attr('disabled', false);
        $("#othercity").show();
        $('#othrloc').show();
        $("#othercity").focus();
    } else {
        $(".othertcitylocality").hide();
        $('#locality').attr('disabled', false);
    }
});

$('#locality').change(function () {
    if ($(this).find('option:selected').val() == "Other") {
        var citytext = $('#city option:selected').text();
        $(".othertcitylocality").show();
        $('#locality').attr('disabled', false);
        $('#othercity').hide();
        $('#othrloc').hide();
        $('#otherlocality').attr('disabled', false);
        $("#otherlocality").focus();
        $("#othercity").val(citytext);
    } else {
        $(".othertcitylocality").hide();
    }
});

$('#city1').change(function () {

    if ($(this).find('option:selected').val() == "Other") {
        $(".othertcitylocalitygrab").show();
     //   $("#dropdown3").off('click');
         $('.cityIdVal').attr('disabled', true);
        $('#othercity1, #otherlocality1').attr('disabled', false);
        $('#othercity1').show();
        $('#othrloc1').show();
		$('.disableselect').show();
		
        $("#othercity1").focus();
    } else {
        $(".othertcitylocalitygrab").hide();
        $('#cityIdVal').attr('disabled', false);
		$('.disableselect').hide();		
    }
});

$('#locality1').change(function () {
    if ($(this).find('option:selected').val() == "Other") {
        var citytext = $('#city1 option:selected').text();
        $(".othertcitylocalitygrab").show();
        $('#locality1').attr('disabled', false);
        $('#othercity1').hide();
        $('#othrloc1').hide();
        $('#otherlocality1').attr('disabled', false);
        $("#otherlocality1").focus();
        $("#othercity1").val(citytext);
    } else {
        $(".othertcitylocalitygrab").hide();
    }
});



$('#lookingfor').change(function () {
    if ($(this).find('option:selected').val() == "Pre-Leased Property") {


        $('#hidetenant').show();

    } else {
        $('#hidetenant').hide();
    }
});






$(".showloginPanel").click(function () {

    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        $('html, body').animate({ scrollTop: ($('.fieldset1').offset().top) }, 500);
    }
    if (animating) return false;
    animating = true;
    current_fs = $(".fieldset3");
    next_fs = $(".fieldset3");
    //$("#progressbar li").eq($("fieldset").index(next_fs)).addClass("active");

    next_fs.show();


    $(".fieldset1, .fieldset2").animate({ opacity: 0 }, {
        step: function (now, mx) {
            left = (now * 50) + "%";
            opacity = 1 - now;
            current_fs.css({ 'transform': 'scale(' + scale + ')' });
            next_fs.css({ 'left': left, 'opacity': opacity });
        },
        duration: 800,
        complete: function () {
            //current_fs.hide();
            animating = false;
        },
        easing: 'easeInOutBack'
    });

});

$(".previous").click(function () {
    if (animating) return false;
    animating = true;
    current_fs = $(this).parent();
    previous_fs = $(this).parent().prev();
    $("#progressbar li").eq($("fieldset").index(current_fs)).removeClass("active");
    previous_fs.show();
    current_fs.animate({ opacity: 0 }, {
        step: function (now, mx) {
            left = ((1 - now) * 50) + "%";
            opacity = 1 - now;
            current_fs.css({ 'left': left });
            previous_fs.css({ 'transform': 'scale(' + scale + ')', 'opacity': opacity });
        },
        duration: 800,
        complete: function () {
            current_fs.hide();
            animating = false;
        },
        easing: 'easeInOutBack'
    });
});

$(".submit").click(function () {
    return false;
});



$(".showcase_propertypanel").click(function () {
    $(".overlaycommon").fadeIn('fast');
    $(".shyprotyFrm").show().animate({ opacity: 1, zoom: 1 }, 500, 'easeInOutBack');
    $("html, body").animate({ scrollTop: 0 }, 300);
	$(".thankyouShowcase").hide();
	$(".frmSectionshowcase").show();
});

$(".grabdeal_property").click(function () {
    $(".overlaycommon").fadeIn('fast');
    $(".grabdealFrm").show().animate({ opacity: 1, zoom: 1 }, 500, 'easeInOutBack');
    $("html, body").animate({ scrollTop: 0 }, 300);
	$(".frmSectiongrab").show();
	$(".thankyougrabdeals").hide();
});

$(".overlaycommon, .closeopog").click(function () {
    $(".shyprotyFrm").animate({ opacity: 0, zoom: 0.5 }, 300, 'easeInOutBack', function () { $(".shyprotyFrm").hide(); $(".overlaycommon").fadeOut('fast'); });
    $(".grabdealFrm").animate({ opacity: 0, zoom: 0.5 }, 300, 'easeInOutBack', function () { $(".grabdealFrm").hide(); $(".overlaycommon").fadeOut('fast'); });

});

$(".list").click(function () {
    $(".overlaylogmenu").stop().fadeIn('fast');
    $(".resp_icon").stop().animate({ right: 0 }, 300);
});

$(".closemenu").click(function () {
    $(".overlaylogmenu").stop().fadeOut('fast');
    $(".resp_icon").stop().animate({ right: -340 }, 300);
});
$(".overlaylogmenu").click(function () {
    $(".overlaylogmenu").stop().fadeOut('fast');
    $(".resp_icon").stop().animate({ right: -340 }, 300);
});



function step1() {
    $(".stepgrab2").hide();
    $(".stepgrab1").show();
}


  $('#owl-carousel2').owlCarousel({
    loop:true,
	// autoplay:true,
   // autoplayTimeout:3000,
    //autoplayHoverPause:true,
    margin:25,
    responsiveClass:true,
    responsive:{
        0:{
            items:1,
            nav:true
        },
        600:{
            items:5,
            nav:true
        },
        1000:{
            items:7,
            nav:true,
            loop:true
        }
    }
});


$(".basic").selectOrDie({
            size: 8
        });

 
  $('.owl-carousel1').owlCarousel({
    loop:true,
	// autoplay:true,
   // autoplayTimeout:3000,
    //autoplayHoverPause:true,
    margin:25,
    responsiveClass:true,
    responsive:{
        0:{
            items:1,
            nav:true
        },
        600:{
            items:2,
            nav:true
        },
        1000:{
            items:1,
            nav:true,
            loop:true
        }
    }
});

 $('.owl-carousel2').owlCarousel({
    loop:true,
	 autoplay:true,
    autoplayTimeout:3000,
     slideSpeed:6000,
    //autoplayHoverPause:true,
    margin:25,
    responsiveClass:true,
    responsive:{
        0:{
            items:1,
            nav:true
        },
        600:{
            items:2,
            nav:true
        },
        1000:{
            items:2,
            nav:true,
            loop:true
        }
    }
});

$('.owl-carousel9').owlCarousel({
    loop:true,
	 autoplay:true,
    autoplayTimeout:3000,
     slideSpeed:6000,
    //autoplayHoverPause:true,
    margin:25,
	dots: false,
    responsiveClass:true,
    responsive:{
        0:{
            items:1,
            nav:true
        },
        600:{
            items:1,
            nav:true
        },
        1000:{
            items:1,
            nav:true,
            loop:true
        }
    }
});

 $('.owl-carousel3').owlCarousel({
    loop:true,
	// autoplay:true,
   // autoplayTimeout:3000,
    //autoplayHoverPause:true,
    margin:25,
    responsiveClass:true,
    responsive:{
        0:{
            items:1,
            nav:true
        },
        600:{
            items:6,
            nav:true
        },
        1000:{
            items:4,
            nav:true,
            loop:true
        }
    }
});


 $('.owl-carousel4').owlCarousel({
    loop:true,
	// autoplay:true,
   // autoplayTimeout:3000,
    //autoplayHoverPause:true,
    margin:25,
    responsiveClass:true,
    responsive:{
        320:{
            items:1,
            nav:true
        },
        600:{
            items:1,
            nav:true
        },
        1000:{
            items:3,
            nav:true,
            loop:true
        }
    }
});


$("#myCarousel1, #myCarousel2, #myCarousel3, #myCarousel4").carousel();
	

 $('#owl-carousel').owlCarousel({
    loop:true,
    margin:10,
	  loop:true,
	 autoplay:true,
    autoplayTimeout:1000,
    autoplayHoverPause:true,
    responsiveClass:true,
    responsive:{
        0:{
            items:1,
            nav:true
        },
        600:{
            items:3,
            nav:true
        },
        1000:{
            items:5,
            nav:true,
            loop:true
        }
    }
});

clickCount = 0;
$(".dropdown dt a").on('click', function() {
clickCount++;
if (clickCount == 1) {
	 $(".dropdown dd .mutliSelect").fadeIn('fast');
	 
	}
if (clickCount == 2) {
	 $(".dropdown dd .mutliSelect").fadeOut('fast');
	clickCount = 0;
    }
});

 
 
 

$(".dropdown dd ul li a").on('click', function() {
  $(".dropdown dd .mutliSelect").hide();
});

function getSelectedValue(id) {
  return $("#" + id).find("dt a span.value").html();
}

$(document).bind('click', function(e) {
  var $clicked = $(e.target);
  if (!$clicked.parents().hasClass("dropdown")) $(".dropdown dd .mutliSelect").hide();
});

//$('.mutliSelect input[type="checkbox"]').on('click', function() {
//
//  var title = $(this).closest('.mutliSelect').find('input[type="checkbox"]').val(),
//    title = $(this).val() + ",";
//
//  if ($(this).is(':checked')) {
//    var html = '<span title="' + title + '">' + title + '</span>';
//    $('.multiSel').append(html);
//    $(".hida").hide();
//  } else {
//    $('span[title="' + title + '"]').remove();
//    var ret = $(".hida");
//    $('.dropdown dt a').append(ret);
//
//  }
//});

 