import React, { useCallback, useState } from 'react'

import { AiOutlineDoubleLeft, AiOutlineSetting } from 'react-icons/ai'
import DoubleIcon from './components/DoubleIcon'
import SettingsModal from './SettingsModal'

import classes from './Sidebar.module.scss'

import type { IconType } from 'react-icons/lib'

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
  const [isOpen, setIsOpen] = useState(false)
  const openModal = useCallback(() => {
    setIsOpen(true)
  }, [])

  return (
    <div className={classes.sidebar}>
      <div className={classes.chatList}></div>
      <div className={classes.settings}>
        <MenuItem Icon={AiOutlineSetting} text='Settings' onClick={openModal} />
        <MenuItem
          Icon={AiOutlineDoubleLeft}
          text='Collapse'
          onClick={props.onClose}
        />
      </div>
      <SettingsModal
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false)
        }}
      />
    </div>
  )
}

export default Sidebar
