import React from "react"
import MyPopover from "./play";
import './home.css'
import { AppBar, Toolbar, Typography, Button, Popover } from '@mui/material';

function MyNavBar()
{
	return (
		<AppBar position="static">
			<Typography variant="h6" component="div" className='my-navbar'>
			<p className="my-navbar-text">To Infinity and Bepong!</p>
			</Typography>
			<MyPopover />
		</AppBar>
	)
}

export default MyNavBar