import { useState } from "react";
import { useNavigate } from "react-router-dom";
import './search.css'

function SearchBar()
{
	const [text, setText] = useState("");
	const navigate = useNavigate();
	async function handleSubmit()
	{
		window.event?.preventDefault();
		if (text == "")
			return ;
		navigate(`/profile/${text}`)
		setText("");
	}
	return(
		<form onSubmit={handleSubmit} className="searchform">
			<input className="searchinput" type="text" placeholder="User Search" value={text}	onChange={(e) => setText(e.target.value)}/>
			<button className="searchbutton">Search</button>
		</form>
	)
}	

export default SearchBar