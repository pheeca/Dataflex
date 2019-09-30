var itemselectClickHandler = function (element, e) {
    e.preventDefault();
    _itemSelected = elementIdentifier(element);
    _itemSelectedElement = element;
    _mode = 'itemselected';
    ProcessMode();
}

var columnTextSelectClickHandler = function (element, e) {
    e.preventDefault();
    _itemColumnSelected = elementIdentifier(element);
    _itemColumnSelectedElement = element;
    _mode = 'columnTextSelected';
    ProcessMode();
}

function elementIdentifier(element) {
    if (!element) return '';
    var label = (element.tagName||'').toLowerCase();
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
        case null:
            myDomOutline.stop();
            _mode = null;
            _itemSelected = null;
            _itemSelectedElement = null;
            _itemColumnSelected = null;
            _itemColumnSelectedElement = null;
            _columns = [];
            $('#itemselect').show();
            $('.xstriped thead').html('');
            $('.xstriped tbody').html('');
            break;
        case "columnTextSelected":
            myDomOutline.stop();
            break;
        case "addColumn":
            if ($('#Column').val()) {
                _columns = _columns || [];
                _columns.push({
                    Name: $('#Column').val(),
                    SelectionElement: _itemColumnSelectedElement,
                    BoxElement: _itemSelectedElement,
                    Index:$(_itemSelectedElement).find(elementIdentifier(_itemColumnSelectedElement)).index($(_itemColumnSelectedElement))
                });
                var _columnsheader =`<tr>${_columns.map(e=>`<th>${e.Name}</th>`).join()}</tr>`;
                $('.xstriped thead').html(_columnsheader);
                var rows='';
                var _itemSelectedElementTemp=elementIdentifier(_itemSelectedElement);
                var rowsItems =$(elementIdentifier(_itemSelectedElement.parentElement)+'>'+_itemSelectedElementTemp);
                debugger
                rowsItems=rowsItems.filter((i,f)=>elementIdentifier(f)==_itemSelectedElementTemp);
                for(var i =0;i<Math.min(rowsItems.length,5);i++){
                    var text=[];
                    for(var j=0;j<_columns.length;j++){
                        text.push($(rowsItems[i]).find(elementIdentifier(_columns[j].SelectionElement)).eq(_columns[j].Index).text()) ;
                    }
                    rows+=  `<tr>${text.map(e=>`<td>${e}</td>`).join()}</tr>`
                }
                $('.xstriped tbody').html(rows);
                $('#Column').val('');
            } else {
                 alert('Column Name Not Provided!') ;
                }
            break;
        default:
            debugger;
            console.log("mode unknown", _mode);
            break;
    }
    return null;
}




function _itemselectLabelText(element, width, height) {
    if (!element) return '';
    var label = (element.tagName||'').toLowerCase();
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
    var x = $(element).text().trim();
    return x;
}


function sendMessage(_type) {
    chrome.runtime.sendMessage({ type: _type }, () => { });
}

console.log('contentScript')
var _mode = null;
var _itemSelected = null;
var _itemSelectedElement = null;
var _itemColumnSelected = null;
var _itemColumnSelectedElement = null;
var _columns = [];
window.onload = function () {
    $('body').append(`<div class="xrow xwraper" >
    <div class="xinput-field xcol xs12">
        <button class="xwaves-effect xwaves-light xbtn" id="reset">Reset</button>
        <button class="xwaves-effect xwaves-light xbtn" id="itemselect">Select Single Item</button>
    </div>
    <div class="xinput-field xcol xs8">
        <input id="Column" class="xvalidate">
        <label for="Column">Column Name</label>
    </div>
    <div class="xinput-field xcol xs2">
    <button class="xwaves-effect xwaves-light xbtn-small" id="columnText"><i class="xmaterial-icons ">insert_link</i>Select Text</button>
    </div>
    <div class="xinput-field xcol xs2">
        <button class="xwaves-effect xwaves-light xbtn-small" id="addColumn"><i class="xmaterial-icons">add</i> Add Column</button>
    </div>
    <table class="xstriped"><thead>
  </thead>
        <tbody>
           <!-- <tr>
                <td>Alvin</td>
                <td>Eclair</td>
                <td>$0.87</td>
            </tr>-->
        </tbody>
    </table>
</div>`);
    jQuery('#reset').on('click', function () {
        _mode = null;
        ProcessMode();
    });

    jQuery('#itemselect').on('click', function (e) {
        _mode = 'itemselect';
        ProcessMode();
    });


    jQuery('#columnText').on('click', function (e) {
        _mode = 'columnTextSelect';
        ProcessMode();
    });

    jQuery('#addColumn').on('click', function (e) {
        _mode = 'addColumn';
        ProcessMode();
    });


    jQuery('a').on('click', function (e) {
        if (_mode == "columnTextSelect") {
            columnTextSelectClickHandler(e.currentTarget, e);
        } else if ("itemselect" == _mode) {
            e.preventDefault();
        }
    });
}
var myDomOutline = DomOutline({ onClick: itemselectClickHandler, filter: ':not(div.xrow.xwraper>*)', compileLabelText: _itemselectLabelText });