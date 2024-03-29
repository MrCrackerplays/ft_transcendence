import { Popover } from '@headlessui/react'
import { useNavigate } from "react-router-dom"
import './navbar.css'
import { Constants } from '../../../../shared/constants';


function GoToLink({ label, link }: { label: string, link: string })
{
	const navigate = useNavigate();
	async function handleClick()
	{
		navigate(`${link}`)
	}
	return (
		<div className="mylink" onClick={handleClick}>
			<p>
				{label}
			</p>
		</div>
	)
}

function MyLogOut({ label}: { label: string})
{
	return (
		<div className="atodiv">
			<a href={`${Constants.BACKEND_URL}/logout`}>
				<p>
					{label}
				</p>
			</a>
		</div>
	)
}
  
function MyLinks()
{
	return (
	  <div className='pfp-popover-content a'>
		<GoToLink label="Home" link="/"/>
		<GoToLink label="Profile" link="/profile" />
		<GoToLink label="Settings" link="/settings" />
		<MyLogOut label="Logout" />
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