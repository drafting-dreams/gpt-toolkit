import { useCallback, useState } from 'react'
import ChatWindow from './ChatWindow'
import Sidebar from './Sidebar'
import Button from './components/Button'

import classes from './index.module.scss'

const SHOW_SIDEBAR = 'show-sidebar'

function Amadeus() {
  const [showSidebar, setShowSideBar] = useState(
    localStorage.getItem(SHOW_SIDEBAR) === '1' ? true : false,
  )
  const hideSideBar = useCallback(() => {
    setShowSideBar(false)
    localStorage.setItem(SHOW_SIDEBAR, '0')
  }, [])

  return (
    <div id='amadeus' className={classes.amadeus}>
      {showSidebar && <Sidebar onClose={hideSideBar} />}
      <ChatWindow />
      {!showSidebar && (
        <Button
          className={classes.settingsButton}
          onClick={() => {
            setShowSideBar(true)
            localStorage.setItem(SHOW_SIDEBAR, '1')
          }}
        >
          Menu
        </Button>
      )}
    </div>
  )
}

export default Amadeus
