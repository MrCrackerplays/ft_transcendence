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
		  <button onClick={deleteAccount} className="deletebutton">Delete</button>
		  <button onClick={onClose} className="cancelbutton">Cancel</button>
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
	return (
		<div className="setting-container">
			<div className="Delete-Button">
				<div className="SettingsDeleteButtonSubmit"><DeleteAccountButton setTrue={() => setshowDelete(true)} setFalse={() => setshowDelete(false)} showDelete={showDelete}/></div>
			</div>
			<div className="SettingsPFP">
				<div className="SettingsPFPImage"></div>
				<div className="SettingsPFPUpload"></div>
				<div className="SettingsPFPSubmit"></div>
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