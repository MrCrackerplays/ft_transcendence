import { Popover } from '@headlessui/react'
import { Link } from "react-router-dom"
import React, {useState} from 'react'
import './navbar.css'

function MyLink({ label, link }: { label: string, link: string })
{
	const [hovered, setHovered] = useState(false);
  
	const handleMouseOver = () => {
	  setHovered(true);
	};
  
	const handleMouseOut = () => {
	  setHovered(false);
	};
  
	const className = `my-link a ${hovered ? 'hovered' : ''}`;
	return (
	  <Link to={link} className={className} onMouseOver={handleMouseOver} onMouseOut={handleMouseOut}>
		{label}
	  </Link>
	);
}
  
function MyLinks()
{
	return (
	  <div className='pfp-popover-content a'>
		<MyLink label="Play" link="/play"/>
		<MyLink label="Profile" link="/profile" />
		<MyLink label="Settings" link="/settings" />
		<MyLink label="Logout" link="/logout" />
	  </div>
	);
}

function MyPopover( {name, imgsrc} )
{
	return (
	  <Popover className="pfp-popover">
		<div className='pfp-flex-box'>
			<p>{name}</p>
			<Popover.Button className="pfp-button">
				<img src={imgsrc} alt="Missing" className="pfp-circle-image"/>
			</Popover.Button>
		</div>
		<Popover.Panel className="pfp-popover-content">
			<MyLinks />
		</Popover.Panel>
	  </Popover>
	)
}

export default MyPopover