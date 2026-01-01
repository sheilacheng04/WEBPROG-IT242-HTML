// Portfolio functionality

// Projects page navigation
let currentPage = 1;
const totalPages = 3;

const pageImages = {
    1: { left: 'assets/left_page1.png', right: 'assets/right_page1.png', leftClick: 1, rightClick: 2 },
    2: { left: 'assets/left_page2.png', right: 'assets/right_page2.png', leftClick: 1, rightClick: 3 },
    3: { left: 'assets/left_page3.png', right: 'assets/right_page3.png', leftClick: 2, rightClick: 3 }
};

function goToPage(pageNumber) {
    if (pageNumber < 1 || pageNumber > totalPages || pageNumber === currentPage) return;
    
    currentPage = pageNumber;
    const leftImg = document.getElementById('leftPageImg');
    const rightImg = document.getElementById('rightPageImg');
    const leftItem = document.querySelector('.project-item-left');
    const rightItem = document.querySelector('.project-item-right');
    
    if (leftImg && rightImg && leftItem && rightItem) {
        leftImg.src = pageImages[pageNumber].left;
        rightImg.src = pageImages[pageNumber].right;
        leftImg.alt = `Left Page ${pageNumber}`;
        rightImg.alt = `Right Page ${pageNumber}`;
        
        // Update click handlers
        leftItem.setAttribute('onclick', `goToPage(${pageImages[pageNumber].leftClick})`);
        rightItem.setAttribute('onclick', `goToPage(${pageImages[pageNumber].rightClick})`);
    }
}

// Zoom functionality
function zoomImage(imageSrc) {
    const modal = document.getElementById('zoomModal');
    const modalImg = document.getElementById('zoomedImage');
    modal.style.display = 'block';
    modalImg.src = imageSrc;
}

function closeZoom() {
    document.getElementById('zoomModal').style.display = 'none';
}
