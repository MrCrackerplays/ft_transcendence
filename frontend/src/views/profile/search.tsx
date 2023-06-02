import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
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
			<input type="text" placeholder="Type to Search..." value={text}	onChange={(e) => setText(e.target.value)}/>
			<button>Search</button>
		</form>
	)
}	

export default SearchBar