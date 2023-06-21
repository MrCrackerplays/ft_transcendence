import React, { useEffect, useState } from 'react'
import './settingsold.css'
import { Constants } from '../../../../shared/constants';
import { PublicUser } from '../../../../shared/public-user';
import FetchSelf from '../../hooks/fetch/FetchSelf';

async function deleteAccount()
{
	console.log("remove")
	window.event?.preventDefault();
	const RESPONSE = await fetch(`${Constants.BACKEND_URL}/remove`, {
		method: 'POST',
		credentials: 'include'
	});
	console.log(RESPONSE.ok);
}

function ModalDelete({onClose})
{
	return (
	  <div className="modaldelete">
		<div className="modaldelete-content">
		  <h2>Delete Account</h2>
		  <p>Are you sure you wish you delete your account?</p>
		  <button onClick={deleteAccount} className="deletebutton">Delete</button>
		  <button onClick={onClose} className="cancelbutton">Cancel</button>
		</div>
	  </div>
	);
}

function SettingsOld() {
	const [name, setName] = useState('')
	const [twofa, setTwofa] = React.useState("")
	const [showdelete, setshowdelete] = useState(false);
	const [self, setSelf] = useState<PublicUser>();

	useEffect(() => {
		async function getSelf()
		{
			setSelf(await FetchSelf());
		}
		getSelf();
	}, []);
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
		console.log({ name })
		console.log(RESPONSE.ok);
	}
	async function handle2fa() {
		window.event?.preventDefault();
		const response = await fetch('http://localhost:3000/2fa', {
			credentials: 'include'
		});
		const body = await response.json();
		const responseBody = body.qr;
		setTwofa(responseBody)
	}
	return (
		<div className='main-body'>
			<form onSubmit={handleName} className="nameChangeform size">
				<label>
					Change Name:
					<input className="size" type="text" value={name} onChange={(e) => setName(e.target.value)} />
				</label>
				<button className="nameSubmit size" type="submit">Submit</button>
			</form>
			<div>
				<button className="twofabutton" onClick={handle2fa}>Enable 2fa!</button>
				<img src={twofa} alt="" />
			</div>
			<button className="setShowDelete size" onClick={() => setshowdelete(true)}>Delete Account</button>
			{showdelete && <ModalDelete onClose={() => setshowdelete(false)} />}
			{/* <img	 src="http://localhost:3000/self/pfp" alt="Not found!"	/> */}
		</div>
	)
}

export default SettingsOld