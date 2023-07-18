import { Constants } from "../../../../shared/constants";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import './loginotp.css'

function LoginOTP()
{
	const [OTPCode, setOTPCode] = useState('')
	const [showError, setShowError] = useState(false)
	const [ErrorName, setErrorName] = useState('')
	const link = Constants.BACKEND_OTP_REDIRECT
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
				code: OTPCode
			})
		});
		if (!RESPONSE.ok)
		{
			setErrorName(RESPONSE.statusText)
			setShowError(true);
			return (false);
		}
		if (RESPONSE.status == 200)
			navigate("/profile")
		setShowError(false);
	}
	return (
		<div className="loginotp">
			<form onSubmit={handleSubmit}>
				<input className="input" placeholder="2fa Code..." type="text" value={OTPCode} onChange={(e) => setOTPCode(e.target.value)}/>
				<button className="aBtn" type="submit">Submit Code</button>
			</form>
			{showError && (
				<div id="error-bar">
					<p className="errortext">{ErrorName}</p>
				</div>
			)}
		</div>
	);
}

export default LoginOTP