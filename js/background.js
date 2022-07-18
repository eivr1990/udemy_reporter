chrome.runtime.onInstalled.addListener( (details) => {
    var currentDate = new Date()

    if (details.reason === chrome.runtime.OnInstalledReason.INSTALL) {
        chrome.storage.local.set({
            udemy: {
                courses: {},
                previousMonthProgress: 0,
                endDate: (new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).toDateString())                
            }
        })
    }
})

chrome.action.onClicked.addListener( (tab) => {
    chrome.action.setBadgeBackgroundColor(
        {
            color: "green",            
        }
    )
})

chrome.tabs.onUpdated.addListener( (tabId, changeInfo, tab) => {
    function sendMessage(tabId) {    
        chrome.tabs.sendMessage(
            tabId,
            {
                message: "update course"
            },

            (response) => {
                var lastError = chrome.runtime.lastError;

                if (lastError) {             
                    // 'Could not establish connection. Receiving end does not exist.'
                    setTimeout(() => {
                        sendMessage(tabId)                        
                    }, 100);                    
                }
                
                console.log(response.message)

                chrome.storage.local.get(['udemy'], (result) => {
                    console.log(result.udemy)
                })

                // chrome.action.setBadgeBackgroundColor(
                //     {
                //         color: "green",            
                //     }
                // )

                // chrome.action.setBadgeText(
                //     {
                //         text: "OK"
                //     }
                // )

                // setTimeout(() => {
                //     chrome.action.setBadgeText(
                //         {
                //             text: ""
                //         }
                //     )
                // }, 1000);
            }
        )
    }
    
    if (changeInfo.url) {
        if (changeInfo.url.indexOf("softtek.udemy.com/course/") > 0 && changeInfo.url.indexOf("#overview") > 0) {                      
            sendMessage(tabId)
        }
    }
})