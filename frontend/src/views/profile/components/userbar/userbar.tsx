import './userbar.css'

function Userbar( {name} : {name:string}){
	return (
		<div className="Userbar">
			<p>
				{name}
			</p>
		</div>
	)
}

export default Userbar