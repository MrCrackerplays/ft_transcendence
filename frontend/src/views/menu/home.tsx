import {useState} from 'react';
import './home.css'
import Menu from './mainMenu';

function HomePage()
{
	const [isSubMenuOpen, setIsSubMenuOpen] = useState(false);
	const menuItems = [
		{
			title: 'play',
			subMenuItems: [
				{title: 'gamemode 1'},
				{title: 'gamemode 2'},
				{title: 'return'}
			]
		},
		{	title: 'profile'	},
		{	title: 'settings'	},
	]

	const handleSubMenuToggle = () => {
		setIsSubMenuOpen(isSubMenuOpen);
	}
	return (
		<Menu />
	)
}

export default HomePage;