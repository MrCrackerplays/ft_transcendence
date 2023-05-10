import React from "react"
import MyPopover from "./play";
import './home.css'
import { AppBar, Toolbar, Typography, Button, Popover } from '@mui/material';

function MyNavBar( {name} )
{
	return (
		<div className="my-navbar">
			<MyPopover name={name}/>
		</div>
	)
}

export default MyNavBar