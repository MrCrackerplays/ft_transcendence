import { useEffect, useState } from "react";
import FetchSelf from "../../../hooks/fetch/FetchSelf";
import DefaultProfile, { PublicUser } from "../../../../../shared/public-user";
import FetchBlocked from "../../../hooks/fetch/FetchBlocked";
import { Constants } from "../../../../../shared/constants";
import './blockprofile.css'

function BlockProfile({UUID} : {UUID : String})
{
	const [blockState, setBlockState] = useState('Loading');
	const [jsonData, setJsonData] = useState<PublicUser>(DefaultProfile());
	const [blockArray, setBlockArray] = useState<Array<PublicUser>>([]);
	useEffect(() => {
		async function getSelf()
		{
			setJsonData(await FetchSelf());
		}
		getSelf();
	}, [])
	useEffect(() => {
		async function getBlocked()
		{
			setBlockArray(await FetchBlocked());
			// if (jsonData.id == UUID)
			// {
			// 	setBlockState("Self");
			// }
		}
		getBlocked()
	}, [jsonData])
	useEffect(() => {
		async function checkBlocked()
		{
			if (blockState == "Self")
				return ;
			for (let i = 0; i < blockArray.length; i++)
			{
				if (blockArray[i].id == UUID)
				{
					setBlockState("Blocked");
					return ;
				}		
			}
			setBlockState("Unblocked");
		}
		checkBlocked()
	}, [blockArray])
	async function handleLoading() {
		window.event?.preventDefault();
	}
	async function handleSelf(){
		window.event?.preventDefault();
	}
	async function handleUnblocked()
	{
		window.event?.preventDefault();
		const RESPONSE = await fetch(`${Constants.FETCH_SELF}/block`, {
			method: 'POST',
			credentials: 'include',
			headers: {
				'content-type': "application/json"
			},
			body: JSON.stringify({
				id: UUID
			})
		})
		if (RESPONSE.status >= 200 && RESPONSE.status <= 299) {
			setBlockState("Blocked");
			// location.reload();
		}
	}
	async function handleBlocked(){
		window.event?.preventDefault();
		const RESPONSE = await fetch(`${Constants.FETCH_SELF}/unblock`, {
			method: 'POST',
			credentials: 'include',
			headers: {
				'content-type': 'application/json'
			},
			body: JSON.stringify({
				id: UUID
			})
		})
		if (RESPONSE.status >= 200 && RESPONSE.status <= 299) {
			setBlockState("Unblocked")
			// location.reload();
		}
	}
	if (blockState == "Loading"){
		return (
			<form onSubmit={handleLoading}>
				<button type="submit" className="add-block-btn self-block">Loading . . .</button>
			</form>
		)
	}
	//CANT REMOVE SELF && Removing friend that doenst exist is fien
	if (blockState == "Blocked"){
		return (
			<form onSubmit={handleBlocked}>
				<button type="submit" className="add-block-btn remove-block">Unblock</button>
			</form>
		)
	}
	if (blockState == "Unblocked")
	{	
		return (
			<form onSubmit={handleUnblocked}>
			<button type="submit" className="add-block-btn add-block">Block</button>
		</form>
	)
	}
	return (
		<form onSubmit={handleSelf}>
			<button type="submit" className="add-block-btn self-block">Can't Block Yourself(so far)</button>
		</form>
	)
}

export default BlockProfile