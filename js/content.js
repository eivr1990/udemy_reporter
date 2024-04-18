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

            let sections = document.querySelectorAll(".section--section-heading--gDf8W")

            sections.forEach(function(section) {
                if(section.querySelector("button").getAttribute("aria-expanded") == 'false') {
                    section.click()
                }
            })


            let videos = document.querySelectorAll(".curriculum-item-link--curriculum-item--OVP5S")

            videos.forEach(function(video) {
                if (video.querySelector("input").checked) {
                    let metadata = video.querySelectorAll(".curriculum-item-link--metadata--XK804")
                    if (metadata.length > 0) {            
                        let regExp = metadata[0].textContent.includes("hr") ? metadata[0].textContent.includes("min") ? /(\d+)hr (\d+)min/: /(\d+)hr/: /(\d+)min/

                        if (regExp.exec(metadata[0].textContent).length == 3) {
                            let hours = parseInt(regExp.exec(metadata[0].textContent)[1])
                            let minutes = parseInt(regExp.exec(metadata[0].textContent)[2])
                            total += hours * 60 + minutes
                        } else {
                            if (metadata[0].textContent.includes("hr")) {
                                let hours = parseInt(regExp.exec(metadata[0].textContent)[1])
                                total += hours * 60
                            } else {
                                let minutes = parseInt(regExp.exec(metadata[0].textContent)[1])
                                total += minutes
                                let title = video.querySelector("[data-purpose='item-title']").textContent
                                console.log(title + " " + metadata[0].textContent)
                            }
                        }
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
