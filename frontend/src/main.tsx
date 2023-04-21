import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import MyDropdown from './play/play';
import MyMenu from './play/play';
import MyPopover from './play/play';
import MyWins from './play/form';

function Element() {

  console.log("Hello World");

  return (
    <div>
      Hello World
    </div>
  );

};

export default Element

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    {/* <App /> */}
    {/* < Element /> */}
    <MyPopover />
    <MyWins />
  </React.StrictMode>,
)