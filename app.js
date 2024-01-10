const pageButtons = document.querySelectorAll('.pageButton');
const mainContent = document.querySelector('.content');

// Templates and Main Zones ***********************************************************************
const piece = document.querySelector('#piece').content;
const bundle = document.querySelector('#bundle').content;
const section = document.querySelector('#section').content;
const detail = document.querySelector('#detail').content;
const picture = document.querySelector('#picture').content;
const pieceTray = document.querySelector('#pieceTray');
const frameTray = document.querySelector('#frameTray');

// to fill out the page and keep the html small
for (let i = 0; i < 3; i++) { pieceTray.append(piece.cloneNode('true')); }

pieceTray.append(detail.cloneNode('true'));
pieceTray.append(picture.cloneNode('true'));

let fillFrame = bundle.cloneNode('true');
fillFrame.querySelector('.bundle').classList.add('inTray');
fillFrame.querySelector('.material').draggable = false;
let bundleNoFabrics = fillFrame.cloneNode('true');
bundleNoFabrics.querySelector('.material').remove();

frameTray.append(fillFrame);
frameTray.append(bundleNoFabrics);

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

// Hover text -------------------
for (let btn of pageButtons) {
    let pageLabel = document.createElement('div');
    pageLabel.classList.add('pageLabel');
    pageLabel.innerText = btn.value;

    btn.addEventListener('mouseenter', () => {
        document.body.appendChild(pageLabel)
        const dif = (btn.offsetWidth - pageLabel.offsetWidth) / 2
        pageLabel.style.left = `${btn.offsetLeft + dif}px`;
        pageLabel.classList.add('move');
    })

    btn.addEventListener('mouseleave', () => {
        pageLabel.classList.remove('move');
        pageLabel.remove();
    })
}

// Drag and Drop Section ***********************************************************************

let dragItem, siblings, parents, newZone, sorting, controller, signal, target, dragGhost;

// Define all areas and what sorts of information they can take. This is represented by "data-itemtype" in html for a lightweight way of making zones.
const dropZonePairs = {
    pieces: 'piece',
    materials: 'material',
    content: ['bundle', 'section'],
    details: ['detail'],
    detail: ['piece', 'material']
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

    startHistory(dragItem, dragItem.nextElementSibling);

    if (dragItem.classList.contains('inTray')) {
        dragItem = ev.target.cloneNode('true');
        startHistory(dragItem, 'tray', 'create');
    };

    //This feels like overkill? but it does the job. The second line cleans up 90% but not the item on the ground. 
    hover.hide();
    if (dragItem.querySelector('.float')) { dragItem.querySelector('.float').remove(); }

    dragGhost = dragItem.cloneNode('true');
    dragGhost.classList.add('ghost', 'inTray');
    document.body.append(dragGhost);
    ev.dataTransfer.setDragImage(dragGhost, 0, 0);
    dragItem.classList.add('dragging');

    // identify all like objects and install listening
    siblings = mainContent.querySelectorAll(`*[data-itemtype='${dragItem.dataset.itemtype}']:not(.dragging)`);
    siblings.forEach(sibling => {
        sibling.addEventListener('dragover', dragOverItem, { signal });
    })

    // identify the proper zones and install listening
    let zones = getObjectKey(dropZonePairs, dragItem.dataset.itemtype);
    let correctZone = zones.map((area) => `[data-itemtype='${area}']`).toString()

    try {
        parents = (zones.toString() === 'content') ? [mainContent] : mainContent.querySelectorAll(correctZone)
        parents.forEach(parent => {
            if (!parent.dataset.dropzone) {
                parent.addEventListener('dragenter', dragEnter, { signal });
                parent.addEventListener('dragover', dragOverZone, { signal });
                parent.addEventListener('dragleave', dragLeave, { signal });
                parent.classList.add('available');
            }
        })
    } catch (error) {
        console.log('no parents')
    }
})

document.addEventListener('drop', (e) => {
    if (e.target.name != 'uploadPiece') {
        controller.abort();
        stopHighlight();
    }
})

document.addEventListener('dragend', (e) => {
    if (e.target.name != 'uploadPiece') {
        controller.abort();
        dragItem.classList.remove('dragging');
        if (dragItem.parentElement !== pieceTray) {
            dragItem.classList.remove('inTray');
            makeEditable(dragItem);
            let materials = dragItem.querySelectorAll('.material')
            if (materials) { for (let material of materials) material.draggable = true }
            if (dragItem.dataset.itemtype === 'piece') { dragItem.querySelector('input').classList.add('hidden') };
        }
        stopHighlight();
        dragGhost.remove();
        stopHistory(dragItem, dragItem.nextElementSibling);
    }
})

function stopHighlight() { parents.forEach(parent => { parent.classList.remove('available', 'target'); }) }

function dragEnter(e) {
    target = e.target;
    this.classList.add('target');
    e.preventDefault();
    e.stopPropagation();
    return false;
}

function dragLeave(e) {
    if (target == e.target) { this.classList.remove('target'); }
}

function dragOverZone(e) {
    e.preventDefault()
    if (newZone !== this) {
        newZone = this;
        sorting = false;
        if (newZone.dataset.itemtype === 'detail') {
            treasureDrop(this);
            return;
        }
    }
    if (!sorting && newZone.dataset.itemtype != 'detail') { this.insertBefore(dragItem, this.firstChild); }
}

function dragOverItem(e) {
    e.preventDefault()
    sorting = true;
    this.parentElement.insertBefore(dragItem, this);
}

function treasureDrop(detail) {
    detail = detail.querySelector('.treasure')
    detail.appendChild(dragItem)
}

function makeEditable(item) { for (let part of item.querySelectorAll('.typeable')) { part.contentEditable = true; } }

// Trash Button ======================================
const deleteButton = document.querySelector('#trash')
function wakeUp(item) { item.classList.toggle('awake') }

deleteButton.addEventListener('drop', () => {
    stopHistory(dragItem, 'delete', 'delete');
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
let leftButtons = document.querySelectorAll('.top .leftButton');
let time;

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
    let img = ev.target.nextElementSibling;
    img.setAttribute('src', fileName);
    img.innerHTML = '';
    ev.target.parentElement.classList.remove('unloaded');
    // this works great to fix the information order if setting this class correctly since it assigns it previous to load without it
    // img.addEventListener('load', () => { if (img.naturalHeight > img.naturalWidth) { img.classList.add('portrait') }; })
}

document.addEventListener('change', (e) => { if (verifyUpload(e.target.name)) { dropHandler(e) } })
document.addEventListener('dragover', (e) => { if (verifyUpload(e.target.name)) { e.target.parentElement.classList.add('selected') } })
document.addEventListener('dragleave', (e) => { if (verifyUpload(e.target.name)) { e.target.parentElement.classList.remove('selected') } })
document.addEventListener('drop', (e) => { if (verifyUpload(e.target.name)) { e.target.parentElement.classList.remove('selected') } })

function verifyUpload(thing) { return thing === 'uploadPiece' };

addPieceButton.addEventListener('click', () => {
    pieceTray.append(piece.cloneNode('true'));
})


// Hover Menu ---------------------------------------------------
class pictureMenu {
    constructor() {
        this.buttons = ['rotate', 'flip', 'magnify'];
        this.menu;
        this.image;
        this.frame;
    }
    set location(target) {
        target = target.closest('.pieceFrame');
        if (target) {
            if (target !== this.frame) {
                this.frame = target;
                this.image = this.frame.querySelector('img');
                this.validTarget() ? this.popUp() : this.hide();
            }
        }
        else { this.hide(); }
    }
    buildMenu() {
        this.menu = document.createElement('div');
        this.menu.classList.add('float');
        this.fillMenu();
        let buttons = this.menu.querySelectorAll('svg');
        for (let button of buttons) {
            button.addEventListener('click', (e) => { this[e.target.closest('svg').dataset.name](); })
        }
    }

    fillMenu() { for (let button of this.buttons) { this.menu.appendChild(createIcon(button)); } }
    validTarget() { return (this.frame && !this.frame.classList.contains('unloaded')); }
    popUp() {
        this.menu.classList.remove('hidden');
        this.frame.appendChild(this.menu);
    }
    hide() {
        this.menu.classList.add('hidden');
        this.frame = ''
    }
    rotate() {
        let rotation = this.image.dataset.rotation;
        rotation = (rotation + 90) % 360;
        this.image.dataset.rotation = rotation;
        this.image.style.transform = `rotate(${rotation}deg)`;
    }
    flip() { this.image.classList.toggle('flipped'); }
    magnify() {

    }
}

let hover = new pictureMenu
hover.buildMenu();

document.addEventListener('mousemove', (e) => { try { hover.location = e.target; } catch (error) { } })

// document.addEventListener('mouseleave', (e) => { if (e.target.classList === 'pieceFrame') { e.target.querySelector('.float').remove(); } })


// ----------------- Screen Button Events -------------------
const screenButtons = document.querySelectorAll('.screenButton')
const caption = document.querySelector('#caption')

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

for (let button of screenButtons) {
    button.addEventListener('mouseenter', () => {
        caption.innerText = button.dataset.value
        caption.classList.toggle('transparent');
    });
    button.addEventListener('mouseleave', () => {
        caption.classList.toggle('transparent');
    });
}

// --------------------------------- History Events -----------------------------------
let userHistory = [];
let position = 0;
let historyStart, historyStop;

function startHistory(item, value, change = 'move') {
    if (value === null) { value = item.parentElement };
    historyStart = { item: item, start: value, change: change };
};

function stopHistory(item, value, change) {
    if (item === historyStart.item) {
        if (value === null) { value = item.parentElement };
        arguments.length == 3 ? historyStop = { stop: value, change: change } : historyStop = { stop: value };
        writeHistory(historyStart, historyStop);
    }
};

function writeHistory(start, stop) {
    if (start.start !== stop.stop) {
        userHistory.length = position;
        position++;
        userHistory.push({ ...historyStart, ...historyStop });
    }
};

function readHistory(direction) {
    try {
        let reference;

        if (direction === 'undo') { position-- };

        let { item, start, stop, change } = userHistory[position];
        if (direction === 'undo') {
            reference = start;
            if (change === 'create' || change === 'delete') { change === 'create' ? change = 'delete' : change = 'create' }
        } else {
            reference = stop;
            position++;
        }

        switch (change) {
            case 'text':
                item.innerText = reference
                break;
            case 'move':
            case 'create':
                reference.classList.contains('card') ? reference.insertAdjacentElement('beforebegin', item) : reference.appendChild(item);
                item.classList.remove('dragging');
                break;
            case 'delete':
                item.remove()
                break;
        }

    } catch (error) {
        alert(`Nothing to ${direction}`);
    }
}

document.addEventListener('focusin', (e) => { if (e.target.classList.contains('typeable')) { startHistory(e.target, e.target.innerText, 'text'); } });
document.addEventListener('focusout', (e) => { if (e.target.classList.contains('typeable')) { stopHistory(e.target, e.target.innerText); } });

const undo = document.querySelector('#undo');
const redo = document.querySelector('#redo');

undo.addEventListener('click', () => { readHistory('undo') })
redo.addEventListener('click', () => { readHistory('redo') })

// ------------------------------ Dropdown Menu Functions ------------------------------

class dropdown {
    constructor(item) {
        this.func = item.dataset.function;
        this.container = item.closest('section');
        this.sibling = this.container.nextElementSibling;
        this.fabrics = this.container.querySelector('.fabrics');
    }
    delete() {
        startHistory(this.container, this.sibling, 'delete');
        stopHistory(this.container, 'delete');
        this.container.remove();
    }
    deleteFabrics() { this.fabrics.innerHTML = '' }
    duplicate() {
        mainContent.insertBefore(this.container.cloneNode('true'), this.sibling);
        startHistory(this.container, 'tray', 'create');
        stopHistory(this.container, this.sibling);
    }
    fuse() {
        this.container.classList.toggle('fused');
        if (this.container.classList.contains('fused')) {
            let hotButton = createIcon('hot');
            hotButton.classList.add('hot', 'notification', 'shadowed');
            this.container.appendChild(hotButton);
        }
        else { this.container.querySelector('.hot').remove() }
    }
    runFunction() { this[this.func](); }
}

document.addEventListener('click', function (e) {
    try { let menuSelection = new dropdown(e.target); menuSelection.runFunction(); }
    catch (error) { }

    if (e.target.closest('.treasure')) {
        e.target.closest('.treasure').classList.toggle('closed');
        e.target.closest('.treasure').classList.toggle('open');
    }
});

function createIcon(iconName) {
    let icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    icon.innerHTML = icons[`${iconName}`].path;
    icon.setAttribute('viewBox', icons[`${iconName}`].viewbox);
    icon.dataset.name = iconName;
    return icon;
}

// ----------------- Detail Writing Keycommands -------------------
document.addEventListener('keydown', (e) => {
    let item = e.target
    if (item.parentElement.classList.contains('detail')) {
        let container = item.closest('.cardContainer');

        if (e.key === 'Enter') {
            e.preventDefault();
            let newLine = item.parentElement.cloneNode('true');
            startHistory(newLine, 'tray', 'create');
            stopHistory(newLine, item.parentElement.nextElementSibling);
            container.insertBefore(newLine, item.parentElement.nextElementSibling);
            newLine.querySelector('span').focus();
        };

        // if (e.key === 'Enter' && e.ctrlKey === true) {
        //     e.target.append(item.cloneNode('true'));
        // }
    }
})

import { icons } from "./icons.js";