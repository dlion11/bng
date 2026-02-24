export const MAX = 75
export const BINGO = ['B', 'I', 'N', 'G', 'O']
export const NUMBER_PER_COL = MAX / BINGO.length

export const numberPool = []
export const numbers = {}
for (let i = 0; i < BINGO.length; i++) {
	for (let j = i * NUMBER_PER_COL + 1; j <= NUMBER_PER_COL * (i + 1); j++) {
		const ball = {
			letter: BINGO[i],
			value: j,
		}
		numbers[j] = ball
		numberPool.push(ball)
	}
}

export const session = {
	pool: [...numberPool],
	history: [],
}

const { pool, history } = session
session.drawBall = function (number) {
	if (pool.length === 0) return null

	const drawnId = pool.map(x => x.value).indexOf(number)
	if (drawnId < 0) return null

	const ball = pool.splice(drawnId, 1)[0]
	history.push(ball)

	// console.log({ pool, history })

	return ball
}

session.drawRandom = function () {
	const ball = pool[Math.floor(Math.random() * pool.length)]
	return session.drawBall(ball?.value)
}

session.restart = function () {
	pool.length = 0
	pool.push(...numberPool)
	history.length = 0

	// console.log({ pool, history })
}

session.init = function (numbers, hist) {
	pool.length = 0
	pool.push(...numbers)
	history.length = 0
	history.push(...hist)
}
