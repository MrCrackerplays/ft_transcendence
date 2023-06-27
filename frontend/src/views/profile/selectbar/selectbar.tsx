import './selectbar.css'

function SelectBar({matchhistory, setmatchhistory}){	
	function matchbutton(){
		setmatchhistory(true);
	}
	function achievementbutton(){
		setmatchhistory(false)
	}

	return (
	<div className="btn-group" role="group" aria-label="Select Bar">
		<button onClick={matchbutton} className={`btn-group-secondary ${matchhistory ? "active" : "inactive"}`}>Match History</button>
		<button onClick={achievementbutton} className={`btn-group-secondary ${matchhistory ? "inactive" : "active"}`}>Achievements</button>
	</div>
	)
}

export default SelectBar