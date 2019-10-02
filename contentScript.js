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
selectNextPageElement = null;
var selectNextPageClickHandler = function (element, e) {
    e.preventDefault();
    var selectNextPage = elementIdentifier(element);
    var selectNextPageN = '';
    var nextText = -1;
    if (/\d/.test($(element).text())) {
        //N+1 button clicked
        nextText = parseInt($(element).text().trim().replace(/\D/g, ''));
        selectNextPageN += `:contains(${nextText}):first`
    } else {
        //Next button clicked
        if ($(selectNextPage).index(element) == ($(selectNextPage).length - 1)) {
            //Next is last button
            selectNextPage += ":last"
        } else if ($(selectNextPage).index(element) == ($(selectNextPage).length - 2) && $(selectNextPage).length > 3) {
            //Next is second last button
            selectNextPage += ":eq(-2)"
        } else if ($(selectNextPage).index(element) == 0) {
            //Next is first button
            selectNextPage += ":first"
        } else if ($(selectNextPage).index(element) == 1) {
            //Next is second button
            selectNextPage += ":eq(1)"
        }
    }
    selectNextPageElement = { selectNextPage: selectNextPage, selectNextPageN: selectNextPageN, N: nextText };
    _mode = 'nextPageSelected';
    ProcessMode();
}

function elementIdentifier(element) {
    if (!element) return '';
    var label = (element.tagName || '').toLowerCase();
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
            myDomOutline = DomOutline({ onClick: columnTextSelectClickHandler, filter: false, compileLabelText: _itemselectLabelText });
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
            $('#StartScrapping,#SelectNextPage').hide();
            $('.xstriped thead').html('');
            $('.xstriped tbody').html('');
            selectNextPageElement = null;
            _rows = [];
            break;
        case "columnTextSelected":
            myDomOutline.stop();
            break;
        case "addColumn":
            addColumn();
            break;
        case "selectNextPage":
            myDomOutline = DomOutline({ onClick: selectNextPageClickHandler, filter: false, compileLabelText: _columnSelectedLabelText });
            myDomOutline.start();
            break;
        case "nextPageSelected":
            myDomOutline.stop();
            break;
        case "scrapping":
            scrape()
            break;
        default:
            console.log("mode unknown", _mode);
            break;
    }
    return null;
}
var _rows = [];
function scrape() {
    chrome.storage.local.get(["columns", "selectNextPageElement", "rows", "url"], function (_data) {
        if (window.location.href !== _data.url) {
            _rows = _rows || _data.rows || [];
            _columns = _columns || _data.columns || [];
            selectNextPageElement = selectNextPageElement || _data.selectNextPageElement || {};
            var rowsItems = $(_columns[0].BoxElement).filter((i, f) => elementIdentifier(f) == _columns[0].BoxElement.split('>')[1])
            for (var i = 0; i < rowsItems.length; i++) {
                var text = [];
                for (var j = 0; j < _columns.length; j++) {
                    text.push($(rowsItems[i]).find(_columns[j].SelectionElement).eq(_columns[j].Index).text());
                }
                _rows.push(text);
            }
            var data = { columns: _columns, selectNextPageElement: selectNextPageElement, rows: _rows, url: window.location.href };
            chrome.storage.local.set(data);
            scrapeNext();
        } else {
            scrapeNext();
        }
    });
}
function scrapeNext() {
    chrome.storage.local.get(["columns", "selectNextPageElement", "rows", "url"], function (_data) {
        var nextSelector = _data.selectNextPageElement.selectNextPage + _data.selectNextPageElement.selectNextPageN;
        if (_data.selectNextPageElement.N > -1) {
            _data.selectNextPageElement.N++;
            _data.selectNextPageElement.selectNextPageN = `:contains(${selectNextPageElement.N}):first`;
        }
        chrome.storage.local.set(_data);
        debugger
        $(nextSelector).click();
    });
}

function addColumn() {
    if ($('#Column').val()) {
        _columns = _columns || [];
        var _itemSelectedElementTemp = elementIdentifier(_itemSelectedElement);
        var _boxElement = elementIdentifier(_itemSelectedElement.parentElement) + '>' + _itemSelectedElementTemp;
        var rowsItems = $(_boxElement).filter((i, f) => elementIdentifier(f) == _itemSelectedElementTemp);
        _columns.push({
            Name: $('#Column').val(),
            SelectionElement: elementIdentifier(_itemColumnSelectedElement),
            BoxElement: _boxElement,
            Index: $(_itemSelectedElement).find(elementIdentifier(_itemColumnSelectedElement)).index($(_itemColumnSelectedElement))
        });
        var _columnsheader = `<tr>${_columns.map(e => `<th>${e.Name}</th>`).join()}</tr>`;
        $('.xstriped thead').html(_columnsheader);
        var rows = '';
        for (var i = 0; i < Math.min(rowsItems.length, 5); i++) {
            var text = [];
            for (var j = 0; j < _columns.length; j++) {
                text.push($(rowsItems[i]).find(_columns[j].SelectionElement).eq(_columns[j].Index).text());
            }
            rows += `<tr>${text.map(e => `<td>${e}</td>`).join()}</tr>`
        }
        $('.xstriped tbody').html(rows);
        $('#Column').val('');
        $('#StartScrapping,#SelectNextPage').show();
    } else {
        alert('Column Name Not Provided!');
    }
}


function _itemselectLabelText(element, width, height) {
    if (!element) return '';
    var label = (element.tagName || '').toLowerCase();
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
    $('body').append(`<div class="xwraper" >
    <div class="xrow">
        <button class="xwaves-effect xwaves-light xbtn" id="reset">Reset</button>
        <button class="xwaves-effect xwaves-light xbtn" id="itemselect">Select Single Item</button>
        <button class="xwaves-effect xwaves-light xbtn" id="StartScrapping">Start Scrapping</button>
        <button class="xwaves-effect xwaves-light xbtn" id="SelectNextPage">Select Next Page</button>
    </div><div class="xrow">
    <div class="text-input xinput-field">
  <input type="text" id="Column" >
  <label for="input1">Column Name</label>
</div>
    <div class="xinput-field">
    <button class="xwaves-effect xwaves-light xbtn-small" id="columnText">Select Text</button>
    <button class="xwaves-effect xwaves-light xbtn-small" id="addColumn">Add Column</button>
    </div>
    </div>
    <table class="xstriped"><thead>
  </thead>
        <tbody>
        </tbody>
    </table>
</div>`);

    ProcessMode();
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


    jQuery('a,[onclick],[onclick] *').on('click', function (e) {
        if (_mode !== 'scrapping') {
            if (_mode == "columnTextSelect") {
                columnTextSelectClickHandler(e.currentTarget, e);
            } else if ("itemselect" == _mode) {
                e.preventDefault();
            } else if ("selectNextPage" == _mode) {
                selectNextPageClickHandler(e.currentTarget, e);

            }
            e.stopPropagation();
        }
    });

    jQuery('#StartScrapping').on('click', function (e) {
        _mode = 'scrapping';
        ProcessMode();
    });

    jQuery('#SelectNextPage').on('click', function (e) {
        _mode = 'selectNextPage';
        ProcessMode();
    });
    chrome.storage.local.get(["columns", "selectNextPageElement", "rows", "url"], function (_data) {
        _rows = _data.rows || _rows || [];
        _columns = _data.columns || _columns || [];
        selectNextPageElement = _data.selectNextPageElement || selectNextPageElement || null;
        if (_columns.length > 0) {
            _mode = 'scrapping';
            ProcessMode();
        }
    });
}
var myDomOutline = DomOutline({ onClick: itemselectClickHandler, filter: '*:not(div.xwraper,div.xwraper *)', compileLabelText: _itemselectLabelText });