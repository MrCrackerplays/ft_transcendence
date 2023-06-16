import React from "react";
import './volume.css'
import muteImg from './mute.png'


const MyButton = ({label, handleClick}) =>
{
	return (
		<div>
			<button
			className="button default"
			onClick={handleClick}>
					<img src={muteImg} alt="Mute" draggable="false"/>
			</button>
		</div>
	)
};

export default MyButton