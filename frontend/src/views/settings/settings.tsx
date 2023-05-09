import MyNavBar from "../../hooks/navbar/navbar";
import MyButton from "./volume";
import muteImg from './mute.png'
import unmuteImg from './unmute.png'

function handleClick(image) {
	console.log("howdy");
	return (
		<div className="button click">
			<img src={unmuteImg} alt="Mute" draggable="false"/>
		</div>
	)
};

function MySettingsPage()
{
  return (
    <div>
      <MyNavBar />
    </div>
  );
}

export default MySettingsPage;