import { Menu, Transition } from '@headlessui/react'
import { Popover } from '@headlessui/react'
import React, {useState} from 'react'
import pfp from './Tateru.png'
import './home.css'

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
	  <a href={link} className={className} onMouseOver={handleMouseOver} onMouseOut={handleMouseOut}>
		{label}
	  </a>
	);
}
  
function MyLinks()
{
	return (
	  <div className='pfp-popover-content a'>
		<MyLink label="Play" link="/Play"/>
		<MyLink label="Profile" link="/Profile" />
		<MyLink label="Settings" link="/Settings" />
		<MyLink label="Logout" link="/Logout" />
	  </div>
	);
}

function MyPopover()
{
	const name = "ThisisAReallyLongusername"
	return (
	  <Popover className="pfp-popover">
		<div className='pfp-flex-box'>
			<p>{name}</p>
			<Popover.Button className="pfp-button">
				<img src={pfp} alt="Tateru" className="pfp-circle-image"/>
			</Popover.Button>
		</div>
		<Popover.Panel className="pfp-popover-content">
			<MyLinks />
		</Popover.Panel>
	  </Popover>
	)
}

export default MyPopover