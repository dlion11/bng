import { BINGO, NUMBER_PER_COL, session } from './lib.js'

const ttsMap = {
	B: 'bee',
	I: 'eye',
	N: 'en',
	G: 'gee',
	O: 'oh',
}

const settings = {
	screenAwake: localStorage.getItem('screenAwake') === 'true' ? true : false,
	tts: localStorage.getItem('tts') === 'true' ? true : false,
	pool: JSON.parse(localStorage.getItem('pool')),
	history: JSON.parse(localStorage.getItem('history')),
}

let wakeLock = null
const wakeLockSwitch = document.querySelector('#screen')
const ttsSwitch = document.querySelector('#tts')

const requestWakeLock = async (onVisibilityChange = true) => {
	if (!settings.screenAwake) return

	try {
		wakeLock = await navigator.wakeLock.request('screen')

		wakeLock.addEventListener('release', () => {
			console.log('Wake lock was released')
			wakeLockSwitch.checked = false
			wakeLock = null
		})

		if (onVisibilityChange) {
			console.log('Wake lock activated')
			wakeLockSwitch.checked = true
		}
	} catch (err) {
		console.error(err)
	}
}

const releaseWakeLock = () => {
	console.log('Releasing wake lock')
	wakeLock.release()
	wakeLock = null
}

wakeLockSwitch.addEventListener('change', e => {
	settings.screenAwake = e.target.checked
	localStorage.setItem('screenAwake', settings.screenAwake)
	e.target.checked ? requestWakeLock() : releaseWakeLock()
})

document.addEventListener('visibilitychange', async () => {
	if (document.visibilityState === 'visible') await requestWakeLock(true)
})

if (settings.screenAwake) {
	await requestWakeLock()
}

ttsSwitch.checked = settings.tts

ttsSwitch.addEventListener('change', e => {
	settings.tts = e.target.checked
	localStorage.setItem('tts', settings.tts)
})

let isDrawing = false

if (settings.history) session.init(settings.pool, settings.history)

const { pool, drawRandom, history } = { ...session }

// Generate history elements
const historySection = document.querySelector('#history__section')
generateHistorySection()

const drawnNumber = document.querySelector('.drawn-number')
const drawnLetter = document.querySelector('.drawn-letter')
const drawnSection = document.querySelector('.drawn')
const spinner = document.querySelector('.spinner')

if (history.length > 0) {
	var latestDraw = history.at(-1)
	drawnLetter.innerText = latestDraw.letter
	drawnNumber.innerText = latestDraw.value
}

const restartBtn = document.querySelector('#btn-restart')
restartBtn.addEventListener('click', () => {
	if (confirm('Are you sure you want to restart?')) {
		drawBtn.disabled = false
		drawnNumber.innerText = ''
		drawnLetter.innerText = ''
		session.restart()

		saveHistory()

		historySection.innerHTML = ''
		generateHistorySection()
	}
})

const drawBtn = document.querySelector('#btn-draw')
async function draw() {
	if (pool.length <= 0) return

	if (isDrawing) return

	isDrawing = true

	const { letter, value } = drawRandom()

	drawnNumber.innerText = ''
	drawnLetter.innerText = ''
	spinner.classList.remove('hidden')
	drawBtn.disabled = true

	// Wait 1 second
	await new Promise(resolve => setTimeout(resolve, 750))

	drawnNumber.innerText = value
	drawnLetter.innerText = letter
	spinner.classList.add('hidden')

	// Wait after speaking
	await new Promise(resolve => {
		let speech = `${ttsMap[letter]}... ${value}`

		if (value >= 10) {
			speech += `... ... ${value.toString()[0]}, ${value.toString()[1]}`
		}

		const message = new SpeechSynthesisUtterance(speech)
		message.lang = 'en-PH'

		if (settings.tts) {
			window.speechSynthesis.speak(message)
		}

		var hist = document.querySelector(`#ball-${value}`)
		hist.classList.add(`col-${letter}`, 'is-drawn')

		saveHistory()

		if (settings.tts) message.onend = resolve
		else resolve()
	})

	if (pool.length <= 0) drawBtn.disabled = true
	else drawBtn.disabled = false

	isDrawing = false
}
drawBtn.addEventListener('click', draw)
drawnSection.addEventListener('click', draw)

function generateHistorySection() {
	for (let i = 0; i < BINGO.length; i++) {
		let header = document.createElement('div')
		header.classList.add(`col-${i + 1}`, 'history-header', `col-${BINGO[i]}`)
		header.innerText = BINGO[i]
		historySection.appendChild(header)
	}

	for (let i = 1; i <= NUMBER_PER_COL; i++) {
		for (let j = 0; j < BINGO.length; j++) {
			const letter = BINGO[j]
			const value = i + NUMBER_PER_COL * j

			let num = document.createElement('div')
			num.id = `ball-${value}`
			num.classList.add('number')

			if (history.find(ball => ball.value === value))
				num.classList.add(`col-${letter}`, 'is-drawn')

			num.innerText = value
			historySection.appendChild(num)
		}
	}
}

function saveHistory() {
	localStorage.setItem('pool', JSON.stringify(pool))
	localStorage.setItem('history', JSON.stringify(history))
}
