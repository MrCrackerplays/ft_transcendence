import './allmissing.css'

function LoggedInMissing()
{
	return (
		<div>
			<h1 className="howdidyougethere">
				How did you get here? I think you went somewhere wrong... go to your profile... save yourself... or don't.
				<br/>I'm not the boss of you. I'm a piece of text.
			</h1>
		</div>
	)
}

export function NotLoggedInMissing()
{
	return(
		<div>
			<h1 className="howdidyoguethere">
				I uh... You should go to /login and make an account, or log in, or something... just not be here, because you can't. you did something you person you.. cut it out i worked hard on this please D:		
			</h1>
		</div>
	)
}

export default LoggedInMissing