import React, { useEffect, useState } from 'react'
import './settings.css'
import { Constants } from '../../../../shared/constants';
import { PublicUser } from '../../../../shared/public-user';
import FetchSelf from '../../hooks/fetch/FetchSelf';
import FetchQREnabled from '../../hooks/fetch/FetchQREnabled';


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
		  <div className="modaldelete-buttons">
		  <button onClick={deleteAccount} className="deletebutton">Delete</button>
		  <button onClick={onClose} className="cancelbutton">Cancel</button>
		  </div>
		</div>
	  </div>
	);
}

function DeleteAccountButton({setTrue, setFalse, showDelete})
{
	return(
		<div>
			<button className="setShowDelete size" onClick={setTrue} >Delete Account</button>
			{showDelete && <ModalDelete onClose={(setFalse)} />}
		</div>
	)
}

function Modal2fa({onClose})
{
	return (
	  <div className="modaldelete">
		<div className="modaldelete-content">
		  <h2>Disable Two-factor authentication</h2>
		  <p>Are you sure you wish you disable your Two-factor authentication?</p>
		  <div className="modaldelete-buttons">
		  <button className="deletebutton">Disable</button>
		  <button onClick={onClose} className="cancelbutton">Cancel</button>
		  </div>
		</div>
	  </div>
	);
}

function QRImg({enabled2fa})
{
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
	return(
		<img src={twofa} alt=""/>
	)
}

function QRButton({buttontype, setenabled2fa})
{
	const [showdisable, setshowdisable] = useState(false);
	if (buttontype == "Loading")
	{
		return (
			<div>
				<button className="loading2fa">Loading...</button>
			</div>
		)
	}
	if (buttontype == "Enabled")
	{
		return(
			<div>
				<button className="disable2fa" onClick={() => setshowdisable(true)}>Disable 2fa</button>
				{showdisable && <Modal2fa onClose={() => setshowdisable(false)}/>}
			</div>
		)
	}
	return (
		<div>
			<button onClick={setenabled2fa} className="enabled2fa" >Enable 2fa</button>
		</div>
	)
}

function Settings({updatescam, setupdatescam}) {
	const [showDelete, setshowDelete] = useState(false);
	const [showerror, setshowerror] = useState(false);
	const [errorText, seterrorText] = useState("");
	const [newusername, setnewusername] = useState("");
	const [enabled2fa, setenabled2fa] = useState("Loading");
	const [enable2faimg, setenabled2faimg] = useState(false);
	const [code2fa, setcoda2fa] = useState("")

	useEffect(() => {
		async function qrEnabled(){
			if (await FetchQREnabled() == true)
				setenabled2fa("Enabled");
			else
				setenabled2fa("Disabled");
		}
		qrEnabled();
	}, [])
	const handlePFPSubmit = async (event) => {
		if (event.target.file.files[0] === null)
			return ;
		const formData = new FormData();
		formData.append('file', event.target.file.files[0])
		window.event?.preventDefault()
		const RESPONSE = await fetch(`${Constants.FETCH_SELF_PFP}`, {
			method: 'POST',
			credentials: 'include',
			body: formData
		});
		setupdatescam(updatescam + 1)
		console.log(RESPONSE.ok);
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
		if (!RESPONSE.ok)
		{
			setshowerror(true)
			seterrorText(RESPONSE.statusText)
		}
		else
		{
			setnewusername("")
			setupdatescam(updatescam + 1)
		}
	}
	const submitQR = async () => {
		//POST TO SUBMT QR GOES HERE LATER IDK
		//PROBABLY SET ERROR HERE IF 2FA CODE WRONG
		return ;
	}
	return (
		<div className="setting-container">
			<div className="Delete-Button">
				<div className="SettingsDeleteButtonSubmit"><DeleteAccountButton setTrue={() => setshowDelete(true)} setFalse={() => setshowDelete(false)} showDelete={showDelete}/></div>
			</div>
			<div className="SettingsPFP">
				<div className="SettingsPFPImage">
					<img key={updatescam} className="SPFPSize" src={`${Constants.FETCH_SELF_PFP}`} alt=""/>
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
					<QRImg enabled2fa={enable2faimg}/>
				</div>
				<div className="SettingsEnableQR">
					<QRButton buttontype={enabled2fa} setenabled2fa={() => setenabled2faimg(true)}/>
				</div>
				<div className="SettingsQRInput">
					<input type="text" placeholder="Validate 2fa..." onChange={(e) => setcoda2fa(e.target.value)} value={code2fa} />
				</div>
				<div className="SettingsQRSubmission">
					<button onClick={submitQR} className="QRSubmitButton">Submit</button>
				</div>
			</div>
		</div>
	)
}

export default Settings