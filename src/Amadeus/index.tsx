import { useCallback, useState } from 'react'
import ChatWindow from './ChatWindow'
import Sidebar from './Sidebar'
import Button from './components/Button'

import classes from './index.module.scss'

function Amadeus() {
  const [showSidebar, setShowSideBar] = useState(false)
  const hideSideBar = useCallback(() => {
    setShowSideBar(false)
  }, [])

  return (
    <div className={classes.amadeus}>
      {showSidebar && <Sidebar onClose={hideSideBar} />}
      <ChatWindow />
      {!showSidebar && (
        <Button
          className={classes.settingsButton}
          onClick={() => {
            setShowSideBar(true)
          }}
        >
          Menu
        </Button>
      )}
    </div>
  )
}

export default Amadeus
