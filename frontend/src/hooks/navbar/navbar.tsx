import React from "react"
import MyPopover from "./play";
import './home.css'
import { AppBar, Toolbar, Typography, Button, Popover } from '@mui/material';

function MyNavBar( {name, imgsrc} )
{
	return (
		<div className="my-navbar">
			<MyPopover name={name} imgsrc={imgsrc}/>
		</div>
	)
}

export default MyNavBar