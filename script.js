const letters = document.querySelectorAll(".letter")
const loadingImg = document.querySelector(".spiral")
const ANSWER_LENGTH = 5
const ROUNDS = 6

async function init() {
    let currentGuess = ""
    let currentRow = 0
    let isLoading = true
    
    const res = await fetch("https://words.dev-apis.com/word-of-the-day")
    const resObj = await res.json()
    const word = resObj.word.toUpperCase()
    const wordArray = word.split("")
    let done = false
    setLoading(false)
    isLoading = false

    console.log(word)

    function addLetter(letter) {
        if(currentGuess.length < ANSWER_LENGTH) {
            currentGuess += letter
        } else {
            currentGuess = currentGuess.substring(0, currentGuess.length - 1) + letter
        }

        letters[ANSWER_LENGTH * currentRow + currentGuess.length - 1].textContent = letter
    }

    function deleteCharacter() {
        currentGuess = currentGuess.substring(0, currentGuess.length -1)
        letters[ANSWER_LENGTH * currentRow + currentGuess.length].textContent = ""
    }

    async function commit() {
        if(currentGuess.length !== ANSWER_LENGTH) {
            return
        }

        isLoading = true
        setLoading(true)
        const res = await fetch("https://words.dev-apis.com/validate-word", {
            method: "POST",
            body: JSON.stringify({ word: currentGuess })
        })

        const resObj = await res.json()
        const validWord = resObj.validWord

        isLoading = false
        setLoading(false)

        if(!validWord) {
            markInvalidWord()
            return
        }

        function markInvalidWord() {
            alert("Not a valid word.")
        }

        const strArray = currentGuess.split("")
        const map = makeMap(wordArray)
        console.log(map)

        for(let i = 0; i < ANSWER_LENGTH; i++) {
            //mark as correct
            if(strArray[i] === wordArray[i]) {
                letters[currentRow * ANSWER_LENGTH + i].classList.add("correct")
                map[strArray[i]]--
            }
        }

        for(let i = 0; i < ANSWER_LENGTH; i++) {
            if(strArray[i] === wordArray[i]) {
                //do nothing
            } else if(wordArray.includes(strArray[i]) && map[strArray[i]] > 0) {
                //mark as close
                letters[currentRow * ANSWER_LENGTH + i].classList.add("close")
                map[strArray[i]]--
            } else {
                //mark as wrong
                letters[currentRow * ANSWER_LENGTH + i].classList.add("wrong")
            }
        }

        currentRow++
        
        if(currentGuess === word) {
            //win
            alert("You win!")
            done = true
            return
        } else if(currentRow === ROUNDS) {
            alert("You lose! The word was " + word)
            done = true
        }

        currentGuess = ""
    }

    function isLetter(letter) {
        return /^[a-zA-Z]$/.test(letter);
    }

    document.addEventListener("keydown", (e) => {
        if(done || isLoading) {
            return
        }
        const key = e.key

        if(key === "Enter") {
            commit()
        } else if(key === "Backspace") {
            deleteCharacter()
        } else if(isLetter(key)) {
            addLetter(key.toUpperCase())
        }
    })

    function setLoading(isLoading) {
        loadingImg.classList.toggle("hidden", !isLoading)
    }

    function makeMap(array) {
        const obj = {}
        for(let i = 0; i < array.length; i++) {
            const letter = array[i]
            if(obj[letter]) {
                obj[letter]++
            } else {
                obj[letter] = 1
            }
        }

        return obj
    }
}



init()