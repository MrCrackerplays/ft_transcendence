import MyFriendsList from "./friendlist/friendlist"

function Sidebar()
{
	return(
		<div className="container">
  			<MyFriendsList />
  			<div className="chatbox"></div>
		</div>
	)
}

export default Sidebar