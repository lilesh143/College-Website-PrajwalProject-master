document.addEventListener('DOMContentLoaded', function() {
    // Main Navigation
    var hamburgerMenu = document.querySelector('.hamburger-menu');
    var siteNavigation = document.querySelector('.site-navigation');

    if (hamburgerMenu && siteNavigation) {
        hamburgerMenu.addEventListener('click', function() {
            this.classList.toggle('open');
            siteNavigation.classList.toggle('show');
        });
    }

    // Hero Slider
    var mySwiper = new Swiper('.hero-slider', {
        slidesPerView: 1,
        spaceBetween: 0,
        loop: true,
        pagination: {
            el: '.swiper-pagination',
            clickable: true,
            renderBullet: function(index, className) {
                return '<span class="' + className + '">' + (index + 1) + '</span>';
            }
        },
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev'
        }
    });

    mySwiper.on('slideChange', function() {
        var current_slide = mySwiper.activeIndex;
        var countdown_date = document.querySelectorAll('.swiper-slide')[current_slide].getAttribute("data-date");

        countdown(countdown_date);
    });

    // Events Slider
    var swiper = new Swiper('.homepage-regional-events-slider', {
        slidesPerView: 6,
        spaceBetween: 30,
        loop: true,
        breakpoints: {
            // Breakpoint settings...
        },
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev'
        }
    });

    // Load more events
    var loadMoreBtn = document.querySelector('.load-more-btn a');
    var container = document.querySelector('.events-list');

    if (loadMoreBtn && container) {
        loadMoreBtn.addEventListener('click', function(e) {
            e.preventDefault();

            var hiddenItems = document.querySelectorAll('.single-event:not(.visible)');
            hiddenItems.forEach(function(item, index) {
                if (index < 6) {
                    item.classList.add('visible');
                }
            });
        });
    }

    // Buy Tickets Form
    var increaseTickets = document.querySelectorAll(".increase-ticket");
    var decreaseTickets = document.querySelectorAll(".decrease-ticket");
    var clearTicketCount = document.querySelector(".clear-ticket-count");

    increaseTickets.forEach(function(item) {
        item.addEventListener('click', function() {
            var n = this.closest(".ticket-row").querySelector(".ticket-count");
            n.value = Number(n.value) + 1;
        });
    });

    decreaseTickets.forEach(function(item) {
        item.addEventListener('click', function() {
            var n = this.closest(".ticket-row").querySelector(".ticket-count");
            var amount = Number(n.value);
            if (amount > 0) {
                n.value = amount - 1;
            }
        });
    });

    if (clearTicketCount) {
        clearTicketCount.addEventListener('click', function() {
            var count = document.querySelectorAll('.ticket-count');
            count.forEach(function(item) {
                item.value = '1';
            });
        });
    }

    // Tabs
    document.querySelectorAll('.tab-content')[0].style.display = 'block';

    document.querySelectorAll('.tab-nav').forEach(function(nav) {
        nav.addEventListener('click', function(e) {
            var $this = this;
            var $tabs = $this.parentNode.parentNode.nextElementSibling;
            var $target = document.querySelector($this.getAttribute("data-target"));
            document.querySelectorAll('.tab-nav').forEach(function(nav) {
                nav.classList.remove('active');
            });
            document.querySelectorAll('.tab-content').forEach(function(content) {
                content.style.display = 'none';
            });
            $this.classList.add('active');
            $target.style.display = 'block';
        });
    });

    // Accordion & Toggle
    document.querySelectorAll('.accordion-wrap.type-accordion').forEach(function(acc) {
        acc.collapsible({
            accordion: true,
            contentOpen: 0,
            arrowRclass: 'arrow-r',
            arrowDclass: 'arrow-d'
        });
    });

    document.querySelectorAll('.accordion-wrap .entry-title').forEach(function(title) {
        title.addEventListener('click', function() {
            document.querySelectorAll('.accordion-wrap .entry-title').forEach(function(title) {
                title.classList.remove('active');
            });
            this.classList.add('active');
        });
    });

    // Circular Progress Bar
    document.getElementById('festivals').circleProgress({
        startAngle: -Math.PI / 4 * 2,
        value: 0.75,
        size: 124,
        fill: {
            gradient: ["#581687", "#ab00ff"]
        }
    }).on('circle-animation-progress', function(event, progress) {
        this.querySelector('strong').innerHTML = Math.round(75 * progress) + '<i>%</i>';
    });

    document.getElementById('concerts').circleProgress({
        startAngle: -Math.PI / 4 * 2,
        value: 0.83,
        size: 124,
        fill: {
            gradient: ["#581687", "#ab00ff"]
        }
    }).on('circle-animation-progress', function(event, progress) {
        this.querySelector('strong').innerHTML = Math.round(83 * progress) + '<i>%</i>';
    });

    document.getElementById('conference').circleProgress({
        startAngle: -Math.PI / 4 * 2,
        value: 0.25,
        size: 124,
        fill: {
            gradient: ["#581687", "#ab00ff"]
        }
    }).on('circle-animation-progress', function(event, progress) {
        this.querySelector('strong').innerHTML = Math.round(25 * progress) + '<i>%</i>';
    });

    document.getElementById('new_artists').circleProgress({
        startAngle: -Math.PI / 4 * 2,
        value: 0.82,
        size: 124,
        fill: {
            gradient: ["#581687", "#ab00ff"]
        }
    }).on('circle-animation-progress', function(event, progress) {
        this.querySelector('strong').innerHTML = Math.round(82 * progress) + '<i>%</i>';
    });

    // Counter
    document.querySelectorAll(".start-counter").forEach(function(counter) {
        counter.countTo({
            formatter: function(value, options) {
                return value.toFixed(options.decimals).replace(/\B(?=(?:\d{3})+(?!\d))/g, ',');
            }
        });
    });

    // Back to Top
    if (document.querySelector('.back-to-top')) {
        var scrollTrigger = 500;
        var backToTop = function() {
            var scrollTop = window.scrollY;
            if (scrollTop > scrollTrigger) {
                document.querySelector('.back-to-top').classList.add('show');
            } else {
                document.querySelector('.back-to-top').classList.remove('show');
            }
        };
        backToTop();
        window.addEventListener('scroll', function() {
            backToTop();
        });
        document.querySelector('.back-to-top').addEventListener('click', function(e) {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // Countdown function
    function countdown(date) {
        $('.countdown').countdown(date, function(event) {
            $('.dday').html(event.strftime('%-D'));
            $('.dhour').html(event.strftime('%-H'));
            $('.dmin').html(event.strftime('%-M'));
            $('.dsec').html(event.strftime('%-S'));
        });
    }
});