import { Constants } from "../../../../shared/constants";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import './newuser.css'

function SetUp()
{
	const [Name, setName] = useState('')
	const [showError, setShowError] = useState(false)
	const [ErrorName, setErrorName] = useState('')
	const link = Constants.BACKEND_SETUP_REDIRECT;
	const navigate = useNavigate()

	async function handleSubmit()
	{
		window.event?.preventDefault();
		const RESPONSE = await fetch(link, {
			method: 'POST',
			credentials: 'include',
			headers: {
				'content-type': "application/json"
			},
			body: JSON.stringify({
				name: Name
			})
		});
		if (!RESPONSE.ok)
		{
			setErrorName(RESPONSE.statusText)
			setShowError(true);
			return (false);
		}
		if (RESPONSE.status == 200)
		{
			const RESPONSE2 = await fetch(`${Constants.BACKEND_URL}/self/achievements`, {
				method: 'POST',
				credentials: 'include',
				headers: {
					'content-type': "application/json"
				},
				body: JSON.stringify({
					name: "Created an Account"
				})
			});
			navigate("/")
		}
		setShowError(false);
	}
	return (
		<div className="newuser">
			<form onSubmit={handleSubmit}>
				<input className="input" placeholder="Input Username..." type="text" value={Name} onChange={(e) => setName(e.target.value)}/>
				<button className="aBtn" type="submit">Submit Name</button>
			</form>
			{showError && (
				<div id="error-bar">
					<p className="errortext">{ErrorName}</p>
				</div>
			)}
		</div>
	);
}

export default SetUp