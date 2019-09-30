debugger;
window.onload = function () {
    console.log("onload" + Date());
    function  sendMessage(_type,_callback){
        _callback=_callback||(()=>{ });
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            chrome.tabs.sendMessage(tabs[0].id, { type: _type },_callback);
        });
    }
    jQuery('#reset').on('click', function () {
        debugger
        console.log(1);
    });

    jQuery('#itemselect').on('click', function () {
        sendMessage('itemselect');
    });
    chrome.runtime.onMessage.addListener(
        function(message, sender, sendResponse) {
            switch(message.type) {
                case "itemselected":
                    $('#itemselect').addClass('disabled');
                    break;
                default:
                    console.error("Unrecognised message: ", message);
            }
        }
    );
}