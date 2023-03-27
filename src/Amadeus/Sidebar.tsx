import React, { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { AiOutlineDoubleLeft, AiOutlineSetting } from 'react-icons/ai'
import classes from './Sidebar.module.scss'
import type { IconType } from 'react-icons/lib'
import DoubleIcon from './components/DoubleIcon'

function Item({
  Icon,
  text,
  onClick,
}: {
  Icon: IconType
  text: string
  onClick: () => void
}) {
  return (
    <div
      className={classes.item}
      onClick={() => {
        onClick()
      }}
    >
      <DoubleIcon Icon={Icon} />
      <div className={classes.gap} />
      {text}
    </div>
  )
}
const MenuItem = React.memo(Item)

type Props = { onClose: () => void }

function Sidebar(props: Props) {
  const navigate = useNavigate()
  const navigateToSettings = useCallback(() => {
    navigate('/amadeus/settings')
  }, [])

  return (
    <div className={classes.sidebar}>
      <div className={classes.chatList}></div>
      <div className={classes.settings}>
        <MenuItem
          Icon={AiOutlineSetting}
          text='Settings'
          onClick={navigateToSettings}
        />
        <MenuItem
          Icon={AiOutlineDoubleLeft}
          text='Collapse'
          onClick={props.onClose}
        />
      </div>
    </div>
  )
}

export default Sidebar
