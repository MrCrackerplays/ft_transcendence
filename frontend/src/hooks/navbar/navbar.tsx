import React from "react"
import MyPopover from "./play";
import './home.css'
import { AppBar, Toolbar, Typography, Button, Popover } from '@mui/material';

function MyNavBar()
{
	return (
		<div className="my-navbar">
			<MyPopover />
		</div>
	)
}

export default MyNavBar