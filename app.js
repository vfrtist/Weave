const pageButtons = document.querySelectorAll('.pageButton');
const mainContent = document.querySelector('.content');

// Templates and Main Zones ***********************************************************************
const piece = document.querySelector('#piece').content;
const bundle = document.querySelector('#bundle').content;
const section = document.querySelector('#section').content;
const detail = document.querySelector('#detail').content;
const pieceTray = document.querySelector('#pieceTray')
const frameTray = document.querySelector('#frameTray')

// to fill out the page and keep the html small

for (let i = 0; i < 3; i++) {
    pieceTray.append(piece.cloneNode('true'));
}

pieceTray.append(detail.cloneNode('true'));

let fillFrame = bundle.cloneNode('true');
fillFrame.querySelector('.bundle').classList.add('inTray');
let bundleNoTitle = fillFrame.cloneNode('true');
bundleNoTitle.querySelector('.material').remove();

frameTray.append(fillFrame);
frameTray.append(bundleNoTitle);

let sectionFrame = section.cloneNode('true');
sectionFrame.querySelector('.section').classList.add('inTray');
frameTray.append(sectionFrame);

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

// As items get dragged out of the tray, we make them editable again. -------------------

function makeEditable(item) { for (part of item.querySelectorAll('.typeable')) { part.contentEditable = true; } }

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

// Define all areas and what sorts of information they can take. This is represented by "data-itemtype" in html for a lightweight way of making zones.
const dropZonePairs = {
    pieces: 'piece',
    materials: 'material',
    content: ['bundle', 'section'],
    details: ['detail'],
    components: ['piece', 'material']
}

function getObjectKey(obj, value) {
    return Object.keys(obj).filter(key => obj[key].includes(value));
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
    let zones = getObjectKey(dropZonePairs, dragItem.dataset.itemtype);
    let correctZone = zones.map((area) => `[data-itemtype='${area}']`).toString()

    parents = (zones.toString() === 'content') ? [mainContent] : mainContent.querySelectorAll(correctZone)
    parents.forEach(parent => {
        parent.addEventListener('dragenter', cancelDefault, { signal });
        parent.addEventListener('dragover', dragOverZone, { signal });
        parent.classList.add('available');
    })
})

document.addEventListener('drop', (e) => {
    if (e.target.name != 'uploadPiece') {
        controller.abort();
        parents.forEach(parent => {
            parent.classList.remove('available');
        })
    }
})

document.addEventListener('dragend', (e) => {
    if (e.target.name != 'uploadPiece') {
        controller.abort();
        dragItem.classList.remove('dragging');
        if (dragItem.parentElement !== pieceTray) {
            dragItem.classList.remove('inTray');
            makeEditable(dragItem);
            if (dragItem.dataset.itemtype === 'piece') { dragItem.querySelector('input').classList.add('hidden') };
        }
        parents.forEach(parent => {
            parent.classList.remove('available');
        })
    }
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

document.addEventListener('keydown', (e) => {
    let item = e.target
    if (e.key === 'Enter' && e.ctrlKey === true && item.parentElement.classList.contains('detail')) {
        let container = item.closest('.cardContainer');
        let newLine = item.parentElement.cloneNode('true');
        container.insertBefore(newLine, item.parentElement.nextElementSibling);
        newLine.querySelector('span').focus();
    }
})

// Trash Button ======================================
const deleteButton = document.querySelector('#trash')
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
let leftButtons = document.querySelectorAll('.top .leftButton')
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

function closeAllLeftMenus() {
    for (let btn of leftButtons) {
        btn.classList.remove('open');
        btn.nextElementSibling.classList.remove('open');
    };
}

// Piece Tray ======================================
const addPieceButton = pieceTray.nextElementSibling

function dropHandler(ev) {
    ev.preventDefault();
    let fileName = URL.createObjectURL(ev.target.files[0]);
    let image = ev.target.nextElementSibling;
    image.setAttribute('src', fileName);
    image.innerHTML = '';
    ev.target.parentElement.classList.remove('unloaded');
    // ev.target.parentElement.appendChild(image);
}

document.addEventListener('change', (e) => { if (verifyUpload(e.target.name)) { dropHandler(e) } })
document.addEventListener('dragover', (e) => { if (verifyUpload(e.target.name)) { e.target.parentElement.classList.add('selected') } })
document.addEventListener('dragleave', (e) => { if (verifyUpload(e.target.name)) { e.target.parentElement.classList.remove('selected') } })
document.addEventListener('drop', (e) => { if (verifyUpload(e.target.name)) { e.target.parentElement.classList.remove('selected') } })

function verifyUpload(thing) {
    return thing === 'uploadPiece'
}

addPieceButton.addEventListener('click', () => {
    pieceTray.append(piece.cloneNode('true'));
})

// ----------------- Screen Button Events -------------------

// Collapse
const viewButton = document.querySelector('#view')
viewButton.addEventListener('click', () => {
    for (let bundle of mainContent.querySelectorAll('.bundle, .section')) { bundle.classList.toggle('collapsed'); };
    viewButton.classList.toggle('on');
});

// Zen Mode
const zenButton = document.querySelector('#zen')
const leftBar = document.querySelector('.leftBar')
zenButton.addEventListener('click', () => {
    closeAllLeftMenus();
    leftBar.classList.toggle('zen');
    zenButton.classList.toggle('on');
    zenButton.parentElement.classList.toggle('zen');
    mainContent.classList.toggle('zen');
});

// ----------------- Generic Dropdown Functions -------------------
document.addEventListener('click', function (e) {
    let func = e.target.dataset.function;
    let container = e.target.closest('section');

    if (func === 'delete') {
        container.remove();
    }

    if (func === 'delete-fabrics') {
        let fabrics = container.querySelectorAll('.material')
        for (fabric of fabrics) { fabric.remove() }
    }

    if (func === 'duplicate') {
        mainContent.insertBefore(container.cloneNode('true'), container.nextElementSibling);
    }

    if (func === 'fuse') {
        container.classList.toggle('fused');
        if (container.classList.contains('fused')) {
            let hotButton = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            hotButton.appendChild(document.createElementNS('http://www.w3.org/2000/svg', 'path'));
            hotButton.firstElementChild.setAttribute('d', "M14.4,0H9.1C8.7,0,8.4,0.3,8.4,0.7s0.3,0.7,0.7,0.7h5.3c0.6,0,1.1,0.5,1.1,1.1v1.3H7.8c-4.2,0-7,5-7.7,6.5,c-0.1,0.3-0.1,0.6,0,0.9c0.2,0.3,0.4,0.4,0.8,0.4h13.9c1.2,0,2.1-1,2.1-2.1V4.5V3.8V2.5C16.9,1.1,15.8,0,14.4,0z M15.5,9.5,c0,0.4-0.3,0.7-0.7,0.7H1.7c0.9-1.6,3.1-5,6.1-5h7.7V9.5z");
            hotButton.classList.add('hot', 'notification', 'shadowed');
            hotButton.setAttribute('viewBox', '0 0 16.9 11.6');
            container.appendChild(hotButton);
        }
        else { container.querySelector('.hot').remove() }
    }
});
