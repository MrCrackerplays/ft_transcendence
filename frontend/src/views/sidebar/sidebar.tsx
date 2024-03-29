import { useEffect, useState } from "react"
import DefaultProfile, { PublicUser } from "../../../../shared/public-user"
import Chat from "./chat/chat"
import FetchSelf from "../../hooks/fetch/FetchSelf"
import MyFriendsList from "./friendlist/friendlist"

function Sidebar() {
	const [isLoading, setIsLoading] = useState(true);
	const [jsonData, setJsonData] = useState<PublicUser>(DefaultProfile());
	const [startDM, setStartDM] = useState<(id:string) => void>((id: string)=>{});

	useEffect(() => {
		const getdata = async () => {
			setJsonData(await FetchSelf())
			setIsLoading(false);
		}
		setIsLoading(true);
		getdata();
	}, []);
	let chat: JSX.Element = <></>
	if (!isLoading) {
		if (!jsonData)
			chat = (<div><h1>Couldn't load chat: User Not Found</h1></div>);
		else
			chat = (<Chat sender={jsonData.userName} sender_id={jsonData.id} setStartDM={setStartDM} />)
	}
	return(
		<div className="sidebarcontainer">
  			<MyFriendsList startDM={startDM} />
  			{chat}
		</div>
	)
}

export default Sidebar