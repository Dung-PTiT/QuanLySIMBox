/**
  * isMobile
  * responsiveMenu
  * headerFixed
  * ajaxContactForm
  * alertBox
  * blog_slider
  * detectViewport
  * flatIconboxCarousel
  * blogCarousel
  * flatClient
  * flatTeam
  * googleMap
  * testimonialSlide
  * flatTestimonials_1
  * portfolioIsotope
  * onepage_nav
  * flatClient
  * flatAccordion
  * tabs
  * responsiveVideo
  * swClick
  * goTop
  * toggleExtramenu
  * retinaLogos
  * parallax
  * removePreloader
*/

;(function($) {

   'use strict'

    var isMobile = {
        Android: function() {
            return navigator.userAgent.match(/Android/i);
        },
        BlackBerry: function() {
            return navigator.userAgent.match(/BlackBerry/i);
        },
        iOS: function() {
            return navigator.userAgent.match(/iPhone|iPad|iPod/i);
        },
        Opera: function() {
            return navigator.userAgent.match(/Opera Mini/i);
        },
        Windows: function() {
            return navigator.userAgent.match(/IEMobile/i);
        },
        any: function() {
            return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows());
        }
    };

	var responsiveMenu = function() {
        var menuType = 'desktop';

        $(window).on('load resize', function() {
            var currMenuType = 'desktop';

            if ( matchMedia( 'only screen and (max-width: 991px)' ).matches ) {
                currMenuType = 'mobile';
            }

            if ( currMenuType !== menuType ) {
                menuType = currMenuType;

                if ( currMenuType === 'mobile' ) {
                    var $mobileMenu = $('#mainnav').attr('id', 'mainnav-mobi').hide();
                    var hasChildMenu = $('#mainnav-mobi').find('li:has(ul)');

                    $('#header').after($mobileMenu);
                    hasChildMenu.children('ul').hide();
                    hasChildMenu.children('a').after('<span class="btn-submenu"></span>');
                    $('.btn-menu').removeClass('active');
                } else {
                    var $desktopMenu = $('#mainnav-mobi').attr('id', 'mainnav').removeAttr('style');

                    $desktopMenu.find('.submenu').removeAttr('style');
                    $('#header').find('.nav-wrap').append($desktopMenu);
                    $('.btn-submenu').remove();
                }
            }
        });

        $('.btn-menu').on('click', function() {         
            $('#mainnav-mobi').slideToggle(300);
            $(this).toggleClass('active');
            return false;
        });

        $(document).on('click', '#mainnav-mobi li .btn-submenu', function(e) {
            $(this).toggleClass('active').next('ul').slideToggle(300);
            e.stopImmediatePropagation();
            return false;
        });
    }

    var headerFixed = function() {
        if ( $('body').hasClass('header_sticky') ) {
            var nav = $('.header');

            if ( nav.size() != 0 ) {
                var offsetTop = $('.header').offset().top,
                    headerHeight = $('.header').height(),
                    injectSpace = $('<div />', { height: headerHeight }).insertAfter(nav);   
                    injectSpace.hide();                 

                $(window).on('load scroll', function(){
                    if ( $(window).scrollTop() > offsetTop + 120 ) {
                        $('.header').addClass('downscrolled');
                        injectSpace.show();
                    } else {
                        $('.header').removeClass('header-small downscrolled');
                        injectSpace.hide();
                    }

                    if ( $(window).scrollTop() > 500 ) {
                        $('.header').addClass('header-small upscrolled');
                    } else {
                        $('.header').removeClass('upscrolled');
                    }
                })
            }
        }     
    };

    var ajaxContactForm = function() {  
        $('#contactform').each(function() {
            $(this).validate({
                submitHandler: function( form ) {
                    var $form = $(form),
                        str = $form.serialize(),
                        loading = $('<div />', { 'class': 'loading' });

                    $.ajax({
                        type: "POST",
                        url:  $form.attr('action'),
                        data: str,
                        beforeSend: function () {
                            $form.find('.form-submit').append(loading);
                        },
                        success: function( msg ) {
                            var result, cls;                            
                            if ( msg == 'Success' ) {                                
                                result = 'Message Sent Successfully To Email Administrator. ( You can change the email management a very easy way to get the message of customers in the user manual )';
                                cls = 'msg-success';
                            } else {
                                result = 'Error sending email.';
                                cls = 'msg-error';
                            }

                            $form.prepend(
                                $('<div />', {
                                    'class': 'flat-alert ' + cls,
                                    'text' : result
                                }).append(
                                    $('<a class="close" href="#"><i class="fa fa-close"></i></a>')
                                )
                            );

                            $form.find(':input').not('.submit').val('');
                        },
                        complete: function (xhr, status, error_thrown) {
                            $form.find('.loading').remove();
                        }
                    });
                }
            });
        }); // each contactform
    };   

    var alertBox = function() {
        $(document).on('click', '.close', function(e) {
            $(this).closest('.flat-alert').remove();
            e.preventDefault();
            return false;
        })     
    }  
   
    var blog_slider = function() { 
        if ( $().flexslider ) {            
            $('.flat-blog-slider').each(function() {
                var $this = $(this)
                $this.find('.flexslider').flexslider({
                    animation      :  "slide",
                    direction      :  "horizontal", // vertical
                    pauseOnHover   :  true,
                    useCSS         :  false,
                    easing         :  "swing",
                    animationSpeed :  500,
                    slideshowSpeed :  5000,
                    controlNav     :  false,
                    directionNav   :  true,
                    slideshow      :  true,
                    prevText       :  '<i class="fa fa-angle-left"></i>',
                    nextText       :  '<i class="fa fa-angle-right"></i>',
                    smoothHeight   :  true
                }); // flexslider
            }); // blog-sider
        }
    }; 

    var detectViewport = function() {
        $('[data-waypoint-active="yes"]').waypoint(function() {
            $(this).trigger('on-appear');
        }, { offset: '90%', triggerOnce: true });

        $(window).on('load', function() {
            setTimeout(function() {
                $.waypoints('refresh');
            }, 100);
        });
    };     

    var blogCarousel = function() {
        $('.blog-carosuel-wrap').each(function(){            
            if ( $().owlCarousel ) {
                $(this).find('.blog-carosuel').owlCarousel({
                    loop: true,
                    margin: 30,
                    nav: false,
                    dots: false, 
                    auto:true,
                    responsive:{
                        0:{
                            items: 1
                        },
                        480:{
                            items: 2
                        },
                        767:{
                            items: 2
                        },
                        991:{
                            items: 3
                        }, 
                        1200:{
                            items: 3
                        }               
                    }
                });
            }            
        });
    };     

    var flatClient = function() {
        $('.flat-row').each(function() {            
            if ( $().owlCarousel ) {
                $(this).find('.flat-client').owlCarousel({
                    loop: true,
                    margin: 5,
                    nav: $('.flat-client').data('nav'),
                    dots: $('.flat-client').data('dots'),                     
                    autoplay: $('.flat-client').data('auto'),                    
                    responsive:{
                        0:{
                            items: 1
                        },
                        480:{
                            items: 2
                        },
                        767:{
                            items: 3
                        },
                        991:{
                            items: 3
                        },
                        1200: {
                            items: $('.flat-client').data('item')
                        }
                    }
                });
            }
        });
    };

    var flatTeam = function() {
        $('.wrap-team').each(function() {            
            if ( $().owlCarousel ) {
                $(this).find('.flat-team-olw').owlCarousel({
                    loop: true,
                    margin: 30,
                    nav: $('.flat-team-olw').data('nav'),
                    dots: $('.flat-team-olw').data('dots'),                     
                    autoplay: $('.flat-team-olw').data('auto'),                    
                    responsive:{
                        0:{
                            items: 1
                        },
                        480: {
                            items: 2
                        },
                        767:{
                            items: 1
                        },
                        991:{
                            items: 1
                        },
                        1200: {
                            items: $('.flat-team-olw').data('item')
                        }
                    }
                });
            }
        });
    };
  
    var googleMap = function() {
        if ( $().gmap3 ) {
            $("#flat-map").gmap3({
                map:{
                    options:{
                        zoom: 11,
                        mapTypeId: 'iseo_style',
                        mapTypeControlOptions: {
                            mapTypeIds: ['iseo_style', google.maps.MapTypeId.SATELLITE, google.maps.MapTypeId.HYBRID]
                        },
                        scrollwheel: false
                    }
                },
                getlatlng:{
                    address:  "PO Box 97845 Baker st. 567, Los Angeles, California, United States",
                    callback: function(results) {
                        if ( !results ) return;
                        $(this).gmap3('get').setCenter(new google.maps.LatLng(results[0].geometry.location.lat(), results[0].geometry.location.lng()));
                        $(this).gmap3({
                            marker:{
                                latLng:results[0].geometry.location,
                                options:{
                                    icon: 'http://themesflat.com/html/iseo/images/icon/marker.png'
                                }
                            }
                        });
                    }
                },
                styledmaptype:{
                    id: "iseo_style",
                    options:{
                        name: "Iseo Map"
                    }, 
                    styles: [
                        {
                            "featureType": "landscape",
                            "stylers": [
                                {
                                    "saturation": -100
                                },
                                {
                                    "lightness": 65
                                },
                                {
                                    "visibility": "on"
                                }
                            ]
                        },

                        {
                            "featureType": "poi",
                            "stylers": [
                                {
                                    "saturation": -100
                                },
                                {
                                    "lightness": 51
                                },
                                {
                                    "visibility": "simplified"
                                }
                            ]
                        },

                        {
                            "featureType": "road.highway",
                            "stylers": [
                                {
                                    "saturation": -100
                                },
                                {
                                    "visibility": "simplified"
                                }
                            ]
                        },

                        {
                            "featureType": "road.arterial",
                            "stylers": [
                                {
                                    "saturation": -100
                                },
                                {
                                    "lightness": 30
                                },
                                {
                                    "visibility": "on"
                                }
                            ]
                        },
                        {
                            "featureType": "road.local",
                            "stylers": [
                                {
                                    "saturation": -100
                                },
                                {
                                    "lightness": 40
                                },
                                {
                                    "visibility": "on"
                                }
                            ]
                        },
                        {
                            "featureType": "transit",
                            "stylers": [
                                {
                                    "saturation": -100
                                },
                                {
                                    "visibility": "simplified"
                                }
                            ]
                        },

                        {
                            "featureType": "administrative.province",
                            "stylers": [
                                {
                                    "visibility": "off"
                                }
                            ]
                        },
                        {
                            "featureType": "water",
                            "elementType": "labels",
                            "stylers": [
                                {
                                    "visibility": "on"
                                },
                                {
                                    "lightness": -25
                                },
                                {
                                    "saturation": -100
                                }
                            ]
                        },
                        {
                            "featureType": "water",
                            "elementType": "geometry",
                            "stylers": [
                                {
                                    "hue": "#edf0f4"
                                },
                                {
                                    "lightness": 17
                                },
                                {
                                    "saturation": -97
                                }
                            ]
                        }
                    ]                   
                },
            });
        }
    };     

    var flatTestimonials_1 = function() {
        $('.flat-row').each(function() {            
            if ( $().owlCarousel ) {
                $(this).find('.flat-testimonials').owlCarousel({
                    loop: true,
                    margin: 30,
                    nav: $('.flat-testimonials').data('nav'),
                    dots: $('.flat-testimonials').data('dots'),                     
                    autoplay: $('.flat-testimonials').data('auto'),                    
                    responsive:{
                        0:{
                            items: 1
                        },
                        767:{
                            items: 1
                        },
                        991:{
                            items: 1
                        },
                        1200: {
                            items: $('.flat-testimonials').data('item')
                        }
                    }
                });
            }
        });
    };

    var portfolioIsotope = function() {         
        if ( $().isotope ) {           
            var $container = $('.portfolio-wrap');
            $container.imagesLoaded(function(){
                $container.isotope({
                    itemSelector: '.item',
                    transitionDuration: '1s'
                });
            });

            $('.portfolio-filter li').on('click',function() {                           
                var selector = $(this).find("a").attr('data-filter');
                $('.portfolio-filter li').removeClass('active');
                $(this).addClass('active');
                $container.isotope({ filter: selector });
                return false;
            });

            $('.flat-portfolio .load-more a').on('click', function(e) {
                e.preventDefault();
                return false;
                var el = $(this),
                    url = el.attr('href'),
                    page = parseInt(el.attr('data-page'), 10);

                el.addClass('loading').text('Loading...');

                $.ajax({
                    type: "GET",
                    url: url,
                    dataType: "html",
                    async: false,   // wait result
                    data : { page : page }
                })
                .done(function (data) {
                    if ( data != null ) {                      
                        var newitem = $(data);
                        $container.append(newitem).isotope('appended', newitem);
                        el.removeClass('loading').text('Load more');
                        page = page + 1;
                        el.attr({'data-page': page, 'href': './ajax/p' + page + '.html'});
                    }
                })
                .fail(function () {
                    el.text('No more portfolio to load.');
                })
            });
        };
    };    

    var flatClient = function() {
        $('.flat-row').each(function() {            
            if ( $().owlCarousel ) {
                $(this).find('.flat-client').owlCarousel({
                    loop: true,
                    margin: 0,
                    nav: $('.flat-client').data('nav'),
                    dots: $('.flat-client').data('dots'),                     
                    autoplay: $('.flat-client').data('auto'),                    
                    responsive:{
                        0:{
                            items: 2
                        },
                        320: {
                            items: 2
                        },
                        480:{
                            items: 2
                        },
                        767:{
                            items: 3
                        },
                        991:{
                            items: 3
                        },
                        1200: {
                            items: $('.flat-client').data('item')
                        }
                    }
                });
            }
        });
    }; 

    var flatAccordion = function() {
        var args = {duration: 600};
        $('.flat-toggle .toggle-title.active').siblings('.toggle-content').show();

        $('.flat-toggle.enable .toggle-title').on('click', function() {
            $(this).closest('.flat-toggle').find('.toggle-content').slideToggle(args);
            $(this).toggleClass('active');
            return false;
        }); // toggle 

        $('.flat-accordion .toggle-title').on('click', function () {
            if( !$(this).is('.active') ) {
                $(this).closest('.flat-accordion').find('.toggle-title.active').toggleClass('active').next().slideToggle(args);
                $(this).toggleClass('active');
                $(this).next().slideToggle(args);
                return false;
            } else {
                $(this).toggleClass('active');
                $(this).next().slideToggle(args);
            }     
        }); // accordion
    }; 
   
    var responsiveVideo= function() {
        if ( $().fitVids ) {
            $('.container').fitVids();
        }
    };

    var swClick = function () {
        function activeLayout () {
            $(".switcher-container" ).on( "click", "a.sw-light", function() {
                $(this).toggleClass( "active" );
                $('body').addClass('home-boxed');  
                $('body').css({'background': '#f6f6f6' });                
                $('.sw-pattern.pattern').css ({ "top": "100%", "opacity": 1, "z-index": "10"});
                return false;
            }).on( "click", "a.sw-dark", function() {
                $('.sw-pattern.pattern').css ({ "top": "98%", "opacity": 0, "z-index": "-1"});
                $(this).removeClass('active').addClass('active');
                $('body').removeClass('home-boxed');
                $('body').css({'background': '#fff' });
                return false;
            })       
        }        

        function activePattern () {
            $('.sw-pattern').on('click', function () {
                $('.sw-pattern.pattern a').removeClass('current');
                $(this).addClass('current');
                $('body').css({'background': 'url("' + $(this).data('image') + '")', 'background-size' : '30px 30px', 'background-repeat': 'repeat' });
                return false
            })
        }

        activeLayout(); 
        activePattern();
    } 
    
    var goTop = function() {
        $(window).scroll(function() {
            if ( $(this).scrollTop() > 800 ) {
                $('.go-top').addClass('show');
            } else {
                $('.go-top').removeClass('show');
            }
        }); 

        $('.go-top').on('click', function() {            
            $("html, body").animate({ scrollTop: 0 }, 500 , 'easeInOutExpo');
            return false;
        });
    };

    var toggleExtramenu = function() {
        $('.menu.menu-extra li a').on('click', function() {
            $('body').toggleClass('off-canvas-active');
            return false;
        });
        $('#site-off-canvas .close').on('click', function() {
            $('body').removeClass('off-canvas-active');
            return false;
        });
    }

    var retinaLogos = function() {
      var retina = window.devicePixelRatio > 1 ? true : false;

        if(retina) {
            $('.header .logo').find('img').attr({src:'./imagess/logo@2x.png',width:'370',height:'70'});
        }
    };    
    
    var parallax = function() {
        if ( $().parallax && isMobile.any() == null ) {
            $('.parallax1').parallax("50%", 0.2);
            $('.parallax4').parallax("50%", 0.4);  
            $('.parallax2').parallax("50%", 0.4);
            $('.parallax3').parallax("50%", 0.5);            
        }
    };

    var popupGallery = function () {
        $(".popup-gallery").magnificPopup({
            type: "image",
            tLoading: "Loading image #%curr%...",
            removalDelay: 600,
            mainClass: "my-mfp-slide-bottom",
            gallery: {
                enabled: true,
                navigateByImgClick: true,
                preload: [ 0, 1 ]
            },
            image: {
                tError: '<a href="%url%">The image #%curr%</a> could not be loaded.'
            }
        });
    }

    var sectionVideo = function () {
        if($().YTPlayer) {
            $(".video-section").YTPlayer( {
                showControls: false,
                autoPlay: false
            }); 
            var v = $('.video-section');
            $('#video-controls a')
            .each(function() {
                var t = $(this);
                t.on('click', (function(e) {
                    e.preventDefault();  
                    if (t.hasClass('fa-play')) {
                        t.removeClass('fa-play')
                            .addClass(
                                'fa-pause');
                        v.playYTP();
                        return false
                    }                  
                    if (t.hasClass('fa-pause')) {
                        t.removeClass(
                                'fa-pause')
                            .addClass('fa-play');
                        v.pauseYTP();
                        return false
                    }                    
                }));
            });
        }
    }

     var counter = function() {       
        $('.flat-counter').on('on-appear', function() {            
            $(this).find('.numb-count').each(function() { 
                var to = parseInt( ($(this).attr('data-to')),10 ), speed = parseInt( ($(this).attr('data-speed')),10 );
                if ( $().countTo ) {
                    $(this).countTo({
                        to: to,
                        speed: speed
                    });
                }
            });
       });
    };

    var removePreloader = function() {        
        $('.loading-overlay').fadeOut('slow',function () {
            $(this).remove();
        });
    };

   	// Dom Ready
	$(function() { 
        if ( matchMedia( 'only screen and (min-width: 991px)' ).matches ) {
            headerFixed();
        }  
        responsiveMenu();        
        googleMap();         
        flatTestimonials_1();         
        blogCarousel();
        blog_slider();
        portfolioIsotope();
        flatClient();
        counter();
        swClick();
        goTop();  
        toggleExtramenu();      
        responsiveVideo();
        flatTeam();
        retinaLogos(); 
        parallax();
        ajaxContactForm();
        flatAccordion();       
        alertBox();
        detectViewport();        
        removePreloader();
   	});

})(jQuery);