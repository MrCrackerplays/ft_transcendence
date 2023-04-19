import { Menu, Transition } from '@headlessui/react'
import { Popover } from '@headlessui/react'
import React, {useState} from 'react'
import pfp from './Tateru.png'
import './play.css'

function MyLink({ label, link }: { label: string, link: string }) {
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
  
  function MyLinks() {
	return (
	  <div className='pfp-popover-content a'>
		<MyLink label="Play" link="/Play"/>
		<MyLink label="Profile" link="/Profile" />
		<MyLink label="Settings" link="/Settings" />
		<MyLink label="Logout" link="/Logout" />
	  </div>
	);
  }

function MyPopover() {

	return (
	  <Popover className="pfp-popover">
		<Popover.Button>
			<img src={pfp} width="30" height="30" alt="Tateru"/>
		</Popover.Button>
		<Popover.Panel className="pfp-popover-content">
			<MyLinks />
		</Popover.Panel>
	  </Popover>
	)
  }

export default MyPopover