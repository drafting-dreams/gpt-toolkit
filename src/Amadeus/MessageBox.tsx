import React from 'react'
import cx from 'classnames'
import classes from './MessageBox.module.scss'
import rintaroAvatar from './assets/rintaro.webp'
import kurisuAvatar from './assets/kurisu.png'

type Props = { message: string; isBot: boolean }

function MessageBox({ message, isBot }: Props) {
  return (
    <div className={classes.messageBox}>
      <img
        className={cx(classes.kurisuAvatar, { [classes.hidden]: !isBot })}
        src={kurisuAvatar}
      />
      <div
        className={cx(classes.message, {
          [classes.textAlignLeft]: isBot,
          [classes.textAlignRight]: !isBot,
        })}
      >
        {message}
      </div>
      <img
        className={cx(classes.rintaroAvatar, { [classes.hidden]: isBot })}
        src={rintaroAvatar}
      />
    </div>
  )
}

export default React.memo(MessageBox)
