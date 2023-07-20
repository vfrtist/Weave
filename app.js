const pageButtons = document.querySelectorAll('.pageButton');
const materialLookUp = document.querySelector('.Material_Number')

let isEditable = false

// to fill out the page and keep the html small
let dupMenu = document.querySelector('.pieces')
for (let i = 1; i < 9; i++) {
    let dupPiece = document.querySelector('.piece').cloneNode('true');
    dupMenu.append(dupPiece);
}

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


// materialLookUp.addEventListener('keydown', function (e) {
//     // e.preventDefault();
//     if (e.key === 'Tab') {
//         materialDescription.innerText = fabrics[materialLookUp.value]
//     };
// })

// ----------------- Piece Sort -------------------
let allPieces = document.querySelectorAll('.piece')
let pieceTray = document.querySelector('#pieceTray')
let pieceMenus = document.querySelectorAll('.pieces:not(#pieceTray)')


let tempPiece;
let movePiece;

allPieces.forEach(piece => {
    piece.addEventListener('dragstart', (e) => {
        // re-align pieces to wherever they are scroll wise 
        allPieces = document.querySelectorAll('.piece');
        piece.classList.add('dragging');
        movePiece = piece.cloneNode('true');
    });

    piece.addEventListener('dragend', (e) => {
        piece.classList.remove('dragging');
        movePiece.classList.remove('dragging');
        if (!(movePiece.parentElement === pieceTray)) {
            movePiece.classList.remove('tray')
        }
    });
})

pieceMenus.forEach(dropTarget => {
    dropTarget.addEventListener('dragenter', cancelDefault);
    dropTarget.addEventListener('dragover', dragOver);
});

function dragOver(e) {
    let siblings = [...this.querySelectorAll('.piece:not(.dragging)')];
    let nextSibling = siblings.find(sibling => {
        return e.pageY <= sibling.offsetTop + sibling.offsetHeight / 2;
    });
    this.insertBefore(movePiece, nextSibling)
}

function cancelDefault(e) {
    e.preventDefault();
    e.stopPropagation();
    return false;
}

// ----------------- Dark Mode (not really working yet but the ideas are there for it) -------------------
const currentTheme = localStorage.getItem('theme') ? localStorage.getItem('theme') : null;

if (currentTheme) {
    document.documentElement.setAttribute('data-theme', currentTheme);

    // if (currentTheme === 'dark') {
    //     darkSwitch()
    // }
}

function darkSwitch() {
    document.documentElement.setAttribute('data-theme', 'purple');
    // document.documentElement.toggleAttribute('data-theme', 'purple');
    // if (document.body.classList.contains('dark-bg')) {
    //     document.documentElement.setAttribute('data-theme', 'dark');
    //     localStorage.setItem('theme', 'dark');
    // } else {
    //     document.documentElement.setAttribute('data-theme', 'light');
    //     localStorage.setItem('theme', 'light');
    // }
}

// ----------------- Left Menu -------------------
let leftButtons = document.querySelectorAll('.leftButton')
let uploadPiece = document.querySelectorAll('input[name="uploadPiece"]')
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

// ----------------- Piece Tray Events -------------------

for (let input of uploadPiece) {
    input.addEventListener('click', () => {
        console.log(input);
    });
    input.addEventListener('change', dropHandler);
}

function dropHandler(ev) {
    ev.preventDefault();
    let fileName = URL.createObjectURL(ev.target.files[0]);
    let image = document.createElement('img');
    image.setAttribute('src', fileName);
    image.innerHTML = '';
    this.parentElement.classList.remove('unloaded');
    this.parentElement.appendChild(image);
}

// ----------------- Screen Button Events -------------------

// View Button
const viewButton = document.querySelector('#view')
viewButton.addEventListener('click', () => {
    for (let bundle of document.querySelectorAll('.bundle')) {
        bundle.classList.toggle('collapsed');
    };
});

// Trash Button 
const deleteButton = document.querySelector('#trash')
let dragItem;
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

document.addEventListener('dragstart', (ev) => {
    dragItem = ev.target;
})