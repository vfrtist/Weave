// ----------------- Page Button Shenanigans -------------------
const pageButtons = document.querySelectorAll('.pageButton');
const materialLookUp = document.querySelector('.Material_Number')
let materialDescription = document.querySelector('.Material_Description')
let allPieces = document.querySelectorAll('.piece')
let pieceMenus = document.querySelectorAll('.pieces')

// Page change -------------------
// const title = document.querySelector('h1');
for (let btn of pageButtons) {
    btn.addEventListener('click', function () {
        makeInActive();
        this.classList.add('active');
    })
}

function makeInActive() {
    for (let btn of pageButtons) { btn.classList.remove('active') }
}

// Hover text -------------------
for (let btn of pageButtons) {
    const pageLabel = document.createElement('div');
    pageLabel.classList.add('pageLabel');
    pageLabel.innerText = btn.title;

    btn.addEventListener('mouseenter', function () {
        document.body.appendChild(pageLabel)
        const dif = (btn.offsetWidth - pageLabel.offsetWidth) / 2
        pageLabel.style.left = `${btn.offsetLeft + dif}px`;
        pageLabel.classList.add('move');
    })

    btn.addEventListener('mouseleave', function () {
        pageLabel.classList.remove('move');
        pageLabel.remove();
    })
}

// ----------------- Material Lookup -------------------
// working but not in use so it's easier to just shut it off for now.


// materialLookUp.addEventListener('keydown', function (e) {
//     // e.preventDefault();
//     if (e.key === 'Tab') {
//         materialDescription.innerText = fabrics[materialLookUp.value]
//     };
// })

// ----------------- Piece Sort -------------------

let tempPiece;
let movePiece;

allPieces.forEach(piece => {
    piece.addEventListener('dragstart', (e) => {
        // make a temporary since drag/drop doesn't work past a certain width
        tempPiece = piece.cloneNode(true);
        tempPiece.classList.add('tempPiece');
        document.body.appendChild(tempPiece)
        e.dataTransfer.setDragImage(tempPiece, 0, 0);

        //change display of dragged item and move to a 
        piece.classList.add('dragging');
        movePiece = piece
    });

    piece.addEventListener('dragend', () => {
        piece.classList.remove('dragging');
        tempPiece.remove()
    });
})

pieceMenus.forEach(dropTarget => {
    dropTarget.addEventListener('dragenter', cancelDefault);
    dropTarget.addEventListener('dragover', dragOver);
});

function dragOver(e) {
    let siblings = [...this.querySelectorAll('.piece:not(.dragging)')];
    let nextSibling = siblings.find(sibling => {
        return e.clientY <= sibling.offsetTop + sibling.offsetHeight / 2;
    });
    this.insertBefore(movePiece, nextSibling)
}

function cancelDefault(e) {
    e.preventDefault();
    e.stopPropagation();
    return false;
}
