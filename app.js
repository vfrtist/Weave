const pageButtons = document.querySelectorAll('.pageButton');
const mainContent = document.querySelector('.content');

// Templates and Main Zones ***********************************************************************
const piece = document.querySelector('#piece').content;
const bundle = document.querySelector('#bundle').content;
const bundleSub = document.querySelector('#bundleSub').content;
const pieceTray = document.querySelector('#pieceTray')
const frameTray = document.querySelector('#frameTray')


// to fill out the page and keep the html small

for (let i = 0; i < 3; i++) {
    pieceTray.append(piece.cloneNode('true'));
    mainContent.append(bundle.cloneNode('true'));
}

let fillFrame = bundle.cloneNode('true');
fillFrame.querySelector('.bundle').classList.add('inTray');
let bundleNoTitle = fillFrame.cloneNode('true');
bundleNoTitle.querySelector('.fabrics').remove();
frameTray.append(fillFrame);
frameTray.append(bundleNoTitle);

// Page change -------------------
for (let btn of pageButtons) {
    btn.addEventListener('click', function () {
        makeInActive();
        this.classList.add('active');
    })
}

function makeInActive() {
    for (let btn of pageButtons) { btn.classList.remove('active') }
}

// Give the option to swap beteen readwrite and not -------------------
let isEditable = false

function readwrite(item) {
    isEditable = !isEditable
    item.contentEditable = isEditable;
}

// Hover text -------------------
for (let btn of pageButtons) {
    let pageLabel = document.createElement('div');
    pageLabel.classList.add('pageLabel');
    pageLabel.innerText = btn.value;

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

// const materialLookUp = document.querySelector('.Material_Number');
// materialLookUp.addEventListener('keydown', function (e) {
//     // e.preventDefault();
//     if (e.key === 'Tab') {
//         materialDescription.innerText = fabrics[materialLookUp.value]
//     };
// })



// Drag and Drop Section ***********************************************************************


// Global Events ======================================
let dragItem;
const dropZonePairs = {
    pieces: 'piece',
    fabrics: 'fabric',
    content: ['bundle', 'sewDetail'],
}

document.addEventListener('dragstart', (ev) => {
    dragItem = ev.target;
    dragItem.classList.add('dragging');
})

document.addEventListener('dragend', (ev) => {
    dragItem.classList.remove('dragging');
})

// Bundles ======================================
let allPieces = document.querySelectorAll('.piece')
let pieceMenus = document.querySelectorAll('.pieces')
let tempPiece;
let movePiece;
let moveSnap = false

allPieces.forEach(piece => {
    piece.addEventListener('dragstart', (e) => {
        // re-align pieces to wherever they are scroll wise 
        allPieces = document.querySelectorAll('.piece');
        movePiece = piece.cloneNode('true');
    });

    piece.addEventListener('dragend', (e) => {
        movePiece.classList.remove('dragging');
        moveSnap = false;
        if (!(movePiece.parentElement === pieceTray)) {
            movePiece.classList.remove('inTray')
        }
    });
})

pieceMenus.forEach(dropTarget => {
    dropTarget.addEventListener('dragenter', cancelDefault);
    dropTarget.addEventListener('dragover', dragOver);
    // dropTarget.addEventListener('dragleave', dragLeave);
});

function dragOver(e) {
    let siblings = [...this.querySelectorAll('.piece:not(.dragging)')];

    if (siblings.includes(e.target)) {
        console.log('moved before another piece');
        this.insertBefore(movePiece, e.target);
        moveSnap = true;
    };

    if (!moveSnap) {
        console.log('moved to container');
        this.append(movePiece);
    }
    // let nextSibling = siblings.find(sibling => {
    //     return e.pageY <= sibling.offsetTop + sibling.offsetHeight / 2;
    // });
    // this.insertBefore(movePiece, nextSibling)
}

function dragLeave(e) {
    dragItem.remove();
}

function cancelDefault(e) {
    e.preventDefault();
    e.stopPropagation();
    return false;
}

// Trash Button ======================================
const deleteButton = document.querySelector('#trash')
function deleteItem(ev) { console.log(ev) };

function wakeUp(item) { item.classList.toggle('awake') }

deleteButton.addEventListener('drop', () => {
    dragItem.remove();
    deleteButton.classList.remove('awake');
})

deleteButton.addEventListener('dragenter', (ev) => {
    ev.preventDefault();
    wakeUp(deleteButton);
})
deleteButton.addEventListener('dragover', (ev) => {
    ev.preventDefault();
})
deleteButton.addEventListener('dragleave', () => {
    wakeUp(deleteButton);
})

//*******************************************************************************************

// ----------------- Dark Mode-------------------
const currentTheme = localStorage.getItem('theme') ? localStorage.getItem('theme') : null;
const darkButton = document.querySelector('#darkButton')

darkButton.addEventListener('click', darkSwitch)

// This returns the value for repeat visits to bring back the same theme as before.
if (currentTheme) {
    document.documentElement.setAttribute('data-theme', currentTheme);
}

function darkSwitch() {
    if (localStorage.getItem('theme') === 'dark') {
        document.documentElement.setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'light');
    } else {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
    }
}

// ----------------- Left Menu -------------------
let leftButtons = document.querySelectorAll('.leftButton')
let uploadPieceImage = document.querySelectorAll('input[name="uploadPiece"]')
let time

for (let btn of leftButtons) {
    btn.addEventListener('click', () => {
        time = 0
        leftButtons.forEach(element => {
            if (element != btn && element.classList.contains('open')) {
                element.nextElementSibling.classList.toggle('open');
                element.classList.toggle('open');
                time = 400
            };
        });
        setTimeout(() => {
            btn.nextElementSibling.classList.toggle('open');
            btn.classList.toggle('open');
        }, time);
    });
}

// Piece Tray ======================================
const addPieceButton = pieceTray.nextElementSibling

function dropHandler(ev) {
    ev.preventDefault();
    let fileName = URL.createObjectURL(ev.target.files[0]);
    let image = document.createElement('img');
    image.setAttribute('src', fileName);
    image.innerHTML = '';
    this.parentElement.classList.remove('unloaded');
    this.parentElement.appendChild(image);
}

for (let input of uploadPieceImage) {
    input.addEventListener('click', () => {
        console.log(input);
    });
    input.addEventListener('change', dropHandler);
    input.addEventListener('dragover', () => {
        input.parentElement.classList.add('selected');
    });
    input.addEventListener('dragleave', () => {
        input.parentElement.classList.remove('selected');
    });
    input.addEventListener('drop', () => {
        input.parentElement.classList.remove('selected');
    });
}

function HoverOver() {
    this.classList.toggle('selected');
    console.log('here');
}

addPieceButton.addEventListener('click', () => {
    pieceTray.append(piece.cloneNode('true'));
})

// ----------------- Screen Button Events -------------------

// View Button
const viewButton = document.querySelector('#view')
viewButton.addEventListener('click', () => {
    for (let bundle of document.querySelectorAll('.bundle')) {
        bundle.classList.toggle('collapsed');
    };
});


// This could be a piece sorting option to get everything into a list --------------------
// viewButton.addEventListener('click', () => {
//     for (let pieces of document.querySelectorAll('.piece:not(.tray)')) {
//         pieces.classList.toggle('big');
//     };
// });

