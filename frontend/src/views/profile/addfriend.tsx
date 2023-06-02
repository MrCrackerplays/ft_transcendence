import { Constants } from "../../../../shared/constants"
import DefaultProfile, { PublicUser } from '../../../../shared/public-user';
import { useState, useEffect } from "react"
import FetchSelf from "../../hooks/fetch/FetchSelf";
import FetchFriends from "../../hooks/fetch/FetchFriends";
import './profile.css'

function AddFriend( {UUID} : {UUID:string}) {
	const [friendState, setfriendState] = useState('Loading');
	const link = Constants.POST_ADDFRIEND;
	const [jsonData, setJsonData] = useState<PublicUser>(DefaultProfile());
	const [friendArray, setFriendArray] = useState<Array<PublicUser>>([]);

	useEffect(() => {
		async function getSelf()
		{
			setJsonData(await FetchSelf());
		}
		getSelf();
	}, [])
	useEffect(() => {
		async function getFriends()
		{
			// console.log(UUID)
			// console.log(jsonData.id)
			if (jsonData.id == UUID)
			{
				// console.log("self change");
				setfriendState("Self");
				return ;
			}
			setFriendArray(await FetchFriends());
		}
		getFriends();
	}, [jsonData])
	useEffect(() => {
		async function checkFriends()
		{
			if (friendState == "Self")
				return ;
			for ( let i = 0; i < friendArray.length; i++)
			{
				if (friendArray[i].id == UUID)
				{
					setfriendState("Remove");
					return ;
				}
			}
			setfriendState("Add");
		}
		checkFriends()
	}, [friendArray])
	async function handleLoading() {
		window.event?.preventDefault();
	}
	async function handleSelf(){
		window.event?.preventDefault();
	}
	async function handleRemove(){
		window.event?.preventDefault();
	}
	async function handleAdd()
	{
		window.event?.preventDefault()
		const RESPONSE = await fetch(link, {
			method: 'POST',
			credentials: 'include',
			headers: {
				'content-type': "application/json"
			},
			body: JSON.stringify({
				id : UUID
			})
		});
		console.log(RESPONSE.status);
		if (RESPONSE.status >= 200 && RESPONSE.status <= 299)
			setfriendState('Remove');
	}

	if (friendState == "Loading"){
		return (
			<form onSubmit={handleLoading}>
				<button type="submit" className="add-friend-btn self-friend">Loading . . .</button>
			</form>
		)
	}
	if (friendState == "Self"){
		return (
			<form onSubmit={handleSelf}>
				<button type="submit" className="add-friend-btn self-friend">Can't Friend Yourself(so far)</button>
			</form>
		)
	}
	if (friendState == "Remove"){
		return (
			<form onSubmit={handleRemove}>
				<button type="submit" className="add-friend-btn remove-friend">Remove Friend</button>
			</form>
		)
	}
	return (
		<form onSubmit={handleAdd}>
			<button type="submit" className="add-friend-btn add-friend">Add Friend</button>
		</form>
	)
}

export default AddFriend