import React, {useState} from 'react'
import './settings.css'
import { Constants } from '../../../../shared/constants';


function Settings() {
	const [name, setName] = useState('')
	const [twofa, setTwofa] = React.useState("")


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
	async function handle2fa()
	{
		window.event?.preventDefault();
		const response = await fetch('http://localhost:3000/2fa',{
			credentials: 'include'
		});
		const body = await response.json();
		const responseBody = body.qr;
		setTwofa(responseBody)
	}
	return (
		<div className='main-body'>
			<form className="size" onSubmit={handleName}>
				<label>
					Change Name:
					<input className="size" type="text" value={name} onChange={(e) => setName(e.target.value)} />
				</label>
				<button type="submit">Submit Name Change!</button>
			</form>
			<div>
				<button onClick={handle2fa}>Enable 2fa!</button>
				<img src={twofa} alt=""	/>
			</div>
			<form method="POST" action={`${Constants.BACKEND_URL}/remove`}>
				<button>!!REMOVE ACCOUNT!!</button>
			</form>
			<div id="iddelete" className="modal">

			</div>
			<img src="http://localhost:3000/self/pfp" alt="Not found!"	/>
		</div>
	)
}

export default Settings