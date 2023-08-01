const pageButtons = document.querySelectorAll('.pageButton');
const mainContent = document.querySelector('.content');

// Templates and Main Zones ***********************************************************************
const piece = document.querySelector('#piece').content;
const bundle = document.querySelector('#bundle').content;
const basket = document.querySelector('#basket').content;
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

// let basketFrame = basket.cloneNode('true');
// basketFrame.querySelector('.basket').classList.add('inTray');

frameTray.append(fillFrame);
frameTray.append(bundleNoTitle);
// frameTray.append(basketFrame);

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
// working but not in use so it's easier to just shut it off for now.
// let isEditable = false

// function readwrite(item) {
//     isEditable = !isEditable
//     item.contentEditable = isEditable;
// }

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
let siblings;
let parents;
let newZone;
let sorting;
let controller;
let signal;

const dropZonePairs = {
    pieces: 'piece',
    materials: 'material',
    content: ['bundle', 'sewDetail'],
}

function getObjectKey(obj, value) {
    return Object.keys(obj).find(key => obj[key].includes(value));
}

document.addEventListener('dragstart', (ev) => {
    // Set all variables
    sorting = false;
    newZone = ""
    controller = new AbortController();
    signal = controller.signal

    dragItem = ev.target;
    if (dragItem.classList.contains('inTray')) { dragItem = ev.target.cloneNode('true') }
    dragItem.classList.add('dragging');

    // identify all like objects and install listening
    siblings = mainContent.querySelectorAll(`*[data-itemtype='${dragItem.dataset.itemtype}']:not(.dragging)`);
    siblings.forEach(sibling => {
        sibling.addEventListener('dragover', dragOverItem, { signal });
    })

    // identify the proper zones and install listening
    parents = mainContent.querySelectorAll(`*[data-itemtype='${getObjectKey(dropZonePairs, dragItem.dataset.itemtype)}']`)
    parents.forEach(parent => {
        parent.addEventListener('dragenter', cancelDefault, { signal });
        parent.addEventListener('dragover', dragOverZone, { signal });
        parent.classList.add('available');
    })
})

document.addEventListener('drop', () => {
    controller.abort();
    parents.forEach(parent => {
        parent.classList.remove('available');
    })
})

document.addEventListener('dragend', () => {
    controller.abort();
    dragItem.classList.remove('dragging');
    if (!(dragItem.parentElement === pieceTray)) {
        dragItem.classList.remove('inTray')
    }
    parents.forEach(parent => {
        parent.classList.remove('available');
    })
})

function dragOverZone(e) {
    e.preventDefault()
    if (newZone !== this) {
        newZone = this;
        sorting = false;
    }
    if (!sorting) { this.insertBefore(dragItem, this.firstChild); }
}

function dragOverItem(e) {
    e.preventDefault()
    sorting = true;
    this.parentElement.insertBefore(dragItem, this);
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

