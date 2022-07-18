pie = document.querySelector(".pie")
totalProgress = document.getElementById("totalProgress")
congrats = document.getElementById("congrats")

chrome.storage.local.get(['udemy'], (result) => {
    udemy = result.udemy
    courses = udemy.courses
    
    currentProgress = 0
    for (const [course, info] of Object.entries(courses)) {
        currentProgress += info.currentProgress - info.previousProgress
    }

    hours = Math.floor(currentProgress/60)
    minutes = currentProgress % 60
    percentage = Math.floor(currentProgress/480 * 100)

    if (percentage > 100) {
        percentage = 100
    }
    // percentage = Math.floor(480/480 * 100)

    totalProgress.innerText = `${hours}hrs ${minutes}min`
    pie.setAttribute("data-pie", `{ "animationSmooth": "500ms ease-out", "speed": 60, "percent": ${percentage}, "colorSlice": "#9F33E8", "colorCircle": "#f1f1f1", "round": true, "fontColor": "#fff" }`)    

    const circle = new CircularProgressBar("pie")
    circle.initial()

    if (percentage >= 100) {
        congrats.style.display = "block"
        congrats.animate(
            [{ color: "#ADFF2F" }, { color: "transparent" }],
            {
                duration: 500,
                iterations: 8,
                direction: "alternate-reverse",
            }
        )

        setTimeout(() => {
            congrats.animate(
                [{ color: "transparent" }, { color: "#ADFF2F" }],
                {
                    duration: 1000
                }
            )
        }, 4000)
    }
})