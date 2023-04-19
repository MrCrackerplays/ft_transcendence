import { Menu, Transition } from '@headlessui/react'
import { Popover } from '@headlessui/react'
import pfp from './Tateru.png'
import './play.css'

function MyPopover() {
	return (
	  <Popover className="pfp-popover">
		<Popover.Button>
			<img src={pfp} width="30" height="30" alt="Tateru"/>
		</Popover.Button>
		<Popover.Panel className="pfp-popover-content">
		  <div className="pfp-popover-content a ">
			<a href="/Play">Play</a>
			<a href="/Profile">Profile</a>
			<a href="/Settings">Settings</a>
		  </div>
		</Popover.Panel>
	  </Popover>
	)
  }

export default MyPopover