import React, {useState} from 'react'
import FetchSelf from '../../../hooks/fetch/fetchSelf';
import './temp.css'
function Temp() {
	const [name, setName] = useState('')
	const [friend, setFriend] = useState('')

	//MATCH HISTORY
	const [p2, setP2] = useState('')
	const [p1s, setP1S] = useState(0)
	const [p2s, setP2S] = useState(0)
	const [winner, setWinner] = useState(0)
	const [twofa, setTwofa] = React.useState("")

	async function handleMatch() {
		window.event?.preventDefault();
		const data = await FetchSelf()
		if (data == false)
    		return (false)
		// console.log(data.id)
		const RESPONSE = await fetch("http://localhost:3000/matches", {
			method: 'POST',
			credentials: 'include',
			headers: {
				'content-type': "application/json"
			},
			body: JSON.stringify({
					p1ID: data.id,
					p2ID: p2,
					p1Score:p1s,
					p2Score:p2s,
					winner: winner
			})
		})
		// console.log({name})
		console.log(RESPONSE.ok);
	};
	async function handleName() {
		window.event?.preventDefault()
		//POST /self/changename
		const RESPONSE = await fetch("http://localhost:3000/self/changename", {
			method: 'POST',
			credentials: 'include',
			headers: {
				'content-type': "application/json"
			},
			body: JSON.stringify({
				name: name
			})
		});
		console.log({name})
		console.log(RESPONSE.ok);
	}
	async function handleFriend() {
		window.event?.preventDefault()
		const RESPONSE = await fetch("http://localhost:3000/self/friends", {
			method: 'POST',
			credentials: 'include',
			headers: {
				'content-type': "application/json"
			},
			body: JSON.stringify({
				id: friend
			})
		});
		console.log({friend})
		console.log(RESPONSE.ok);
	}
	async function handle2fa()
	{
		window.event?.preventDefault();
		const response = await fetch('http://localhost:3000/2fa',{
			credentials: 'include'
		});
		const responseBody = await response.text();
		setTwofa(responseBody)
	}
	return (
		<div className='white'>
			<form onSubmit={handleName}>
				<label>
					Change Name:
					<input type="text" value={name} onChange={(e) => setName(e.target.value)} />
				</label>
				<button type="submit">Submit Name Change!</button>
			</form>
			<form onSubmit={handleFriend}>
				<label>
					Input Friend UUID:
					<input type="text" value={friend} onChange={(e) => setFriend(e.target.value)} />
				</label>
				<button type="submit">Add Friend!</button>
			</form>
			<form onSubmit={handleMatch}>
				<label>
					Opponent UUID:
					<input type="text" value={p2} onChange={(e) => setP2(e.target.value)} />
				</label>
				<label>
					You're Score:
					<input type="number" value={p1s} onChange={(e) => setP1S(parseInt(e.target.value, 10))} />
				</label>
				<label>
					Opponent Score:
					<input type="number" value={p2s} onChange={(e) => setP2S(parseInt(e.target.value, 10))} />
				</label>
				<label>
					Winner (0 you, 1 enemy):
					<input type="number" value={winner} onChange={(e) => setWinner(parseInt(e.target.value, 10))} />
				</label>
				<button type="submit">Submit Match</button>
			</form>
			<div>
				<button onClick={handle2fa}>Enable 2fa!</button>
				<img src={twofa} alt="Not found!"	/>
			</div>
		</div>
	)
}

export default Temp