import React, {useState} from 'react'
import FetchSelf from '../../../hooks/fetch/fetchSelf';
function Temp() {
	const [name, setName] = useState('')
	const [friend, setFriend] = useState('')

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
	return (
		<div>
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
		</div>
	)
}

export default Temp