var itemselectClickHandler = function (element, e) {
    e.preventDefault();
    _itemSelected = elementIdentifier(element);
    _itemSelectedElement = element;
    _mode = 'itemselected';
    ProcessMode();
}

var columnTextSelectClickHandler = function(element, e){
    e.preventDefault();
    _itemColumnSelected = elementIdentifier(element);
    _itemColumnSelectedElement = element;
    _mode = 'columnTextSelected';
    ProcessMode();
}

function elementIdentifier(element) {
    var label = element.tagName.toLowerCase();
    if (element.id) {
        label += '#' + element.id;
    }
    if (element.className) {
        label += ('.' + jQuery.trim(element.className).replace(/ /g, '.')).replace(/\.\.+/g, '.');
    }
    return label;
}

function ProcessMode() {
    myDomOutline.stop();
    switch (_mode) {
        case "itemselect":
            myDomOutline = DomOutline({ onClick: itemselectClickHandler, filter: false, compileLabelText: _itemselectLabelText });
            myDomOutline.start();
            break;
        case "itemselected":
            $('#itemselect').hide();
            break;
        case "columnTextSelect":
            myDomOutline = DomOutline({ onClick: columnTextSelectClickHandler, filter: false, compileLabelText: _columnSelectedLabelText });
            myDomOutline.start();
            break;
        default:
            debugger;
            console.log("mode unknown", _mode);
            break;
    }
    return null;
}




function _itemselectLabelText(element, width, height) {
    var label = element.tagName.toLowerCase();
    if (element.id) {
        label += '#' + element.id;
    }
    if (element.className) {
        label += ('.' + jQuery.trim(element.className).replace(/ /g, '.')).replace(/\.\.+/g, '.');
    }
    //return label + ' (' + Math.round(width) + 'x' + Math.round(height) + ')';
    return label + ' (Items Count:' + jQuery(label).length + ')';
}

function _columnSelectedLabelText(element) {
    var label = element.tagName.toLowerCase();
    if (element.id) {
        label += '#' + element.id;
    }
    if (element.className) {
        label += ('.' + jQuery.trim(element.className).replace(/ /g, '.')).replace(/\.\.+/g, '.');
    }
    var x=$(element).text().trim();
    return x;
}


function sendMessage(_type) {
    chrome.runtime.sendMessage({ type: _type }, () => { });
}

console.log('contentScript')
var _mode = null;
var _itemSelected = null;
var _itemSelectedElement = null;
var _itemColumnSelected =null;
var _itemColumnSelectedElement =null;
window.onload = function () {
    $('body').append(`<div class="xrow xwraper" >
    <div class="xinput-field xcol xs12">
        <a class="xwaves-effect xwaves-light xbtn" id="reset">Reset</a>
        <a class="xwaves-effect xwaves-light xbtn" id="itemselect">Select Single Item</a>
    </div>
    <div class="xinput-field xcol xs8">
        <input id="Column" class="xvalidate">
        <label for="Column">Column Name</label>
    </div>
    <div class="xinput-field xcol xs2">
    <a class="xwaves-effect xwaves-light xbtn-small" id="columnText"><i class="xmaterial-icons ">insert_link</i>Select Text</a>
    </div>
    <div class="xinput-field xcol xs2">
        <a class="xwaves-effect xwaves-light xbtn-small"><i class="xmaterial-icons">add</i> Add Column</a>
    </div>
    <table class="xstriped">
        <tbody>
            <tr>
                <td>Alvin</td>
                <td>Eclair</td>
                <td>$0.87</td>
            </tr>
        </tbody>
    </table>
</div>`);
    jQuery('#reset').on('click', function () {
        debugger
        console.log(1);
    });

    jQuery('#itemselect').on('click', function (e) {
        _mode = 'itemselect';
        ProcessMode()
    });


    jQuery('#columnText').on('click', function (e) {
        _mode = 'columnTextSelect';
        ProcessMode()
    });
}
var myDomOutline = DomOutline({ onClick: itemselectClickHandler, filter: ':not(div.xrow.xwraper>*)', compileLabelText: _itemselectLabelText });