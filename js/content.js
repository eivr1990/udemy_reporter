async function updateStorage(progress) {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(['udemy'], (result) => {
            currentDate = new Date()
            udemy = result.udemy
            courses = udemy.courses
            endDate = udemy.endDate
        
            // if (new Date(currentDate.innerText) > new Date(endDate)) {
            if (currentDate > new Date(endDate)) {
                // currentDate = new Date(currentDate.innerText)
        
                endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1).toDateString()
                udemy.endDate = endDate
        
                totalProgress = 0    
                for (const [course, info] of Object.entries(courses)) {
                    totalProgress += parseInt(info.currentProgress) - parseInt(info.previousProgress)
                }
                udemy.previousMonthProgress = totalProgress
        
                for (const [course, info] of Object.entries(courses)) {
                    courses[course].previousProgress = info.currentProgress
                }
                udemy.courses = courses
        
                if (!(document.title in courses)) {        
                    courses[document.title] = {
                        "currentProgress": progress,
                        "previousProgress": progress
                    }            
                }
                    
                chrome.storage.local.set({udemy: udemy})
            } else {
                if (!(document.title in courses)) {        
                    courses[document.title] = {
                        "currentProgress": progress,
                        "previousProgress": progress
                    }            
                    udemy.courses = courses
        
                    chrome.storage.local.set({udemy: udemy})
                } else {            
                    courses[document.title].currentProgress = progress
                    udemy.courses = courses        
        
                    chrome.storage.local.set({udemy: udemy})
                }
            }
            
            
            resolve ("updated storage")
        })
    })
}

function waitForElm(selector) {
    return new Promise(resolve => {
        if (document.querySelector(selector)) {
            return resolve(document.querySelector(selector))
        }

        const observer = new MutationObserver(mutations => {
            if (document.querySelector(selector)) {
                resolve(document.querySelector(selector))
                observer.disconnect()
            }
        })

        observer.observe(document.body, {
            childList: true,
            subtree: true
        })
    })
}

function addTime() {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            let total = 0

            let sections = document.querySelectorAll(".section--section-heading--2k6aW")
    
            sections.forEach(function(section) {    
                if(section.querySelector("button").getAttribute("aria-expanded") == 'false') {
                    section.click()
                }
            })
    
    
            let videos = document.querySelectorAll(".curriculum-item-link--curriculum-item--KX9MD")
    
            videos.forEach(function(video) {
                if (video.querySelector("input").checked) {
                    let mins = video.querySelectorAll(".curriculum-item-link--metadata--e17HG")
                    if (mins.length > 0) {            
                        total += parseInt(mins[0].textContent.replace("min",""))
                    }
                }
            })

            resolve(total)
        })
    })
}

function updateCourse() {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            waitForElm("[data-purpose='curriculum-section-container']").then( (elm) => {
                addTime().then( (progress) => {
                    updateStorage(progress).then( (result) => {                        
                        resolve ("updated course")
                    })                
                })
            })
        })
    })
}

chrome.runtime.onMessage.addListener( (message, sender, sendResponse) => {
    if (message.message == "update course"){
        updateCourse().then( (result) => {
            sendResponse(
                {
                    message: result
                }
            )
        })
    
        return true
    }
})

updateCourse()
