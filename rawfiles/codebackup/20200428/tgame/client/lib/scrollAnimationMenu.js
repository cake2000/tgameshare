export class ScrollAnimation {
  // init() {
  //   $(document).ready(() => {
  //     const sefl = this;
  //     $(window).scroll(() => {
  //       sefl.onScroll();
  //     });
  //       // smoothscroll
  //     $('a[href^="#"]').on('click', function(e) {
  //       e.preventDefault();
  //       $(document).off('scroll');
  //       $('a').each(() => {
  //         $(this).removeClass('active');
  //       });
  //       $(this).addClass('active');
  //       const target = this.hash;
  //       const $target = $(target);
  //       $('html, body').stop().animate({
  //         scrollTop: $target.offset().top - 72
  //       }, 500, 'swing', () => {
  //         window.location.hash = target;
  //         $(document).on('scroll', sefl.onScroll());
  //       });
  //     });
  //   });
  // }
  // onScroll() {
  //   const scrollPos = $(document).scrollTop();
  //   $('.nav-link').each(function() {
  //     const currLink = $(this);
  //     const refElement = $(currLink.attr('href'));
  //     if (refElement.position()) {
  //       const position = refElement.offset().top - 72;
  //       if (position <= scrollPos && position + refElement.height() > scrollPos) {
  //         $('.nav-link').removeClass('active');
  //         currLink.addClass('active');
  //       } else {
  //         currLink.removeClass('active');
  //       }
  //     }
  //   });
  // }
}
