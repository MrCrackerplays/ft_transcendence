import { useEffect, useState } from 'react'
import './settings.css'
import { Constants } from '../../../../shared/constants';
import FetchQREnabled from '../../hooks/fetch/FetchQREnabled';
import { useNavigate } from 'react-router-dom';



async function disable2FA() {
	const RESPONSE = await fetch(`${Constants.BACKEND_URL}/2fa/disable`, {
		method: 'POST',
		credentials: 'include'
	});
	window.location.reload();
}

function Modal2fa({ onDisable, onClose }) {
	return (
		<div className="modaldelete">
			<div className="modaldelete-content">
				<h2>Disable Two-factor authentication</h2>
				<p>Are you sure you wish you disable your Two-factor authentication?</p>
				<div className="modaldelete-buttons">
					<button onClick={onDisable} className="deletebutton">Disable</button>
					<button onClick={onClose} className="cancelbutton">Cancel</button>
				</div>
			</div>
		</div>
	);
}

function QRImg({ enabled2fa }) {
	if (!enabled2fa)
		return null;
	const [twofa, setTwofa] = useState("");
	useEffect(() => {
		async function getQR() {
			const RESPONSE = await fetch(`${Constants.BACKEND_URL}/2fa`, {
				credentials: 'include'
			});
			const body = await RESPONSE.json();
			const responseBody = body.qr;
			setTwofa(responseBody);
		}
		getQR();
	}, []);
	return (
		<img src={twofa} alt="" />
	)
}

function QRButton({ buttontype, setenabled2fa }) {
	const [showdisable, setshowdisable] = useState(false);
	if (buttontype == "Loading") {
		return (
			<div>
				<button className="loading2fa">Loading...</button>
			</div>
		)
	}
	if (buttontype == "Enabled") {
		return (
			<div>
				<button className="disable2fa" onClick={() => setshowdisable(true)}>Disable 2fa</button>
				{showdisable && <Modal2fa onDisable={() => { disable2FA(); setshowdisable(false)}} onClose={() => setshowdisable(false)} />}
			</div>
		)
	}
	return (
		<div>
			<button onClick={setenabled2fa} className="enabled2fa" >Enable 2fa</button>
		</div>
	)
}

function Settings({ updatescam, setupdatescam }) {
	const [showerror, setshowerror] = useState(false);
	const [errorText, seterrorText] = useState("");
	const [newusername, setnewusername] = useState("");
	const [enabled2fa, setenabled2fa] = useState("Loading");
	const [enable2faimg, setenabled2faimg] = useState(false);
	const [code2fa, setcoda2fa] = useState("")

	useEffect(() => {
		async function qrEnabled() {
			if (await FetchQREnabled() == true)
				setenabled2fa("Enabled");
			else
				setenabled2fa("Disabled");
		}
		qrEnabled();
	}, [])
	const handlePFPSubmit = async (event) => {
		if (event.target.file.files[0] === null)
			return;
		const formData = new FormData();
		formData.append('file', event.target.file.files[0])
		window.event?.preventDefault()
		const RESPONSE = await fetch(`${Constants.FETCH_SELF_PFP}`, {
			method: 'POST',
			credentials: 'include',
			body: formData
		});
		setupdatescam(updatescam + 1)
	}
	const handleUserNamesubmit = async () => {
		setshowerror(false)
		const RESPONSE = await fetch(`${Constants.BACKEND_URL}/self/changename`, {
			method: 'POST',
			credentials: 'include',
			headers: {
				'content-type': "application/json"
			},
			body: JSON.stringify({
				name: newusername
			})
		});
		if (!RESPONSE.ok) {
			setshowerror(true)
			seterrorText(RESPONSE.statusText)
		}
		else {
			setnewusername("")
			setupdatescam(updatescam + 1)
		}
		window.location.reload();
	}
	const submitQR = async () => {
		setshowerror(false)
		const RESPONSE = await fetch(`${Constants.BACKEND_URL}/2fa/validate`, {
			method: 'POST',
			credentials: 'include',
			headers: {
				'content-type': "application/json"
			},
			body: JSON.stringify({
				code: code2fa
			})
		});
		if (!RESPONSE.ok)
		{
			setshowerror(true)
			seterrorText("QR Input Incorrect")
		} else {
			const RESPONSE2 = await fetch(`${Constants.BACKEND_URL}/self/achievements`, {
				method: 'POST',
				credentials: 'include',
				headers: {
					'content-type': "application/json"
				},
				body: JSON.stringify({
					name: "2fa Secure"
				})
			});
			window.location.reload();
		}
		return;
	}
	return (
		<div className="setting-container">
			<div className="SettingsPFP">
				<div className="SettingsPFPImage">
					<img key={updatescam} className="SPFPSize" src={`${Constants.FETCH_SELF_PFP}`} alt="" />
				</div>
				<div className="SettingsPFPUpload">
					<form onSubmit={handlePFPSubmit}>
						<input className="sPFPInput" type="file" id="file" name="file" accept="image/*" />
						<input className="sPFPSubmit" type="submit" value="Upload New Profile Picture" />
					</form>
				</div>
			</div>
			<div className="SettingsNamechange">
				<div className="SettingsChangeName">
					<p>Change Name:</p>
				</div>
				<div className="SettingsNameInput">
					<input type="text" placeholder="New Username..." onChange={(e) => setnewusername(e.target.value)} value={newusername} />
				</div>
				<div className="SettingsNameSubmit">
					<button onClick={handleUserNamesubmit}>Submit</button>
				</div>
				<div className="SettingsAllError">
					{showerror && (
						<div id="error-bar">
							<p className="errortext">{errorText}</p>
						</div>)}
				</div>
			</div>
			<div className="SettingsQRCode">
				<div className="SettingsQRImg">
					<QRImg enabled2fa={enable2faimg} />
				</div>
				<div className="SettingsEnableQR">
					<QRButton buttontype={enabled2fa} setenabled2fa={() => setenabled2faimg(true)} />
				</div>
				{enabled2fa == "Disabled" && <div>
				<div className="SettingsQRInput">
					<input type="text" placeholder="Validate 2fa..." onChange={(e) => setcoda2fa(e.target.value)} value={code2fa} />
				</div>
				<div className="SettingsQRSubmission">
					<button onClick={submitQR} className="QRSubmitButton">Submit</button>
				</div>
				</div>}
			</div>
		</div>
	)
}

export default Settings