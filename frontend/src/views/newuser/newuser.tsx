import { Constants } from "../../../../shared/constants";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

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
		// let number: number = parseInt(OTPCode)
		// if (isNaN(number))
		// {
		// 	setErrorName("Sorry, you must input a valid number!");
		// 	setShowError(true)
		// 	return (false);
		// }
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
			console.log(RESPONSE)
			setErrorName("Sorry, Something went wrong!")
			setShowError(true);
			return (false);
		}
		if (RESPONSE.status == 200)
			navigate("/profile")
		setShowError(false);
	}
	return (
		<div>
			<form onSubmit={handleSubmit}>
				<input type="text" value={Name} onChange={(e) => setName(e.target.value)}/>
				<button type="submit">Submit Name</button>
			</form>
			{showError && (
				<div id="error-bar">
					<p>{ErrorName}</p>
				</div>
			)}
		</div>
	);
}

export default SetUp