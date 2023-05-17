import MyPopover from "./play";
import './navbar.css'

function MyNavBar( {name, imgsrc} )
{
	return (
		<div className="my-navbar">
			<p className="website">Ball Busters</p>
			<MyPopover name={name} imgsrc={imgsrc}/>
		</div>
	)
}

export default MyNavBar