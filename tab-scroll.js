// Tab Scroll Button Functionality
document.addEventListener('DOMContentLoaded', function () {
    const scrollLeft = document.getElementById('scrollLeft');
    const scrollRight = document.getElementById('scrollRight');
    const tabsScroller = document.getElementById('tabsScroller');

    if (scrollLeft && scrollRight && tabsScroller) {
        scrollLeft.addEventListener('click', () => {
            tabsScroller.scrollBy({
                left: -200,
                behavior: 'smooth'
            });
        });

        scrollRight.addEventListener('click', () => {
            tabsScroller.scrollBy({
                left: 200,
                behavior: 'smooth'
            });
        });
    }
});
