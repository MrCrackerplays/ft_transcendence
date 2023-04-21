import React from "react"
import MyPopover from "./play";
import './home.css'
import { AppBar, Toolbar, Typography, Button, Popover } from '@mui/material';

function MyNavBar()
{
	return (
		<AppBar position="static">
			<Typography variant="h6" component="div" className='my-navbar' flexGrow="1">
			To Infinity and Beyond!
			</Typography>
			<MyPopover />
		</AppBar>
	)
}

export default MyNavBar