import React, { useEffect, useState } from 'react'
import './settings.css'
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

function Settings() {
	const [showDelete, setshowDelete] = useState(false);
	const [scam, setscam] = useState(0);
	const handleSubmit = async (event) => {
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
		console.log(RESPONSE.ok);
	}
	return (
		<div className="setting-container">
			<div className="Delete-Button">
				<div className="SettingsDeleteButtonSubmit"><DeleteAccountButton setTrue={() => setshowDelete(true)} setFalse={() => setshowDelete(false)} showDelete={showDelete}/></div>
			</div>
			<div className="SettingsPFP">
				<div className="SettingsPFPImage">
					<img className="SPFPSize" src={`${Constants.FETCH_SELF_PFP}`} alt=""/>
				</div>
				<div className="SettingsPFPUpload">
				<form onSubmit={handleSubmit}>
					<input className="sPFPInput" type="file" id="file" name="file" accept="image/*" />
					<input className="sPFPSubmit" type="submit" value="Upload" />
				</form>
				</div>
			</div>
			<div className="SettingsNamechange">
				<div className="SettingsChangeName"></div>
				<div className="SettingsNameInput"></div>
				<div className="SettingsNameSubmit"></div>
			</div>
			<div className="SettingsQRCode">
				<div className="SettingsQRImg"></div>
				<div className="SettingsEnableQR"></div>
				<div className="SettingsQRInput"></div>
				<div className="SettingsQRSubmission"></div>
			</div>
		</div>
	)
}

export default Settings