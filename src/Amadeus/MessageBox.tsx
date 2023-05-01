import React from 'react'
import Markdown from 'react-markdown'
import cx from 'classnames'
import classes from './MessageBox.module.scss'
import rintaroAvatar from './assets/rintaro.webp'
import kurisuAvatar from './assets/kurisu.png'

import type { ReactNode } from 'react'

type Props = { message: ReactNode; isBot: boolean }

function MessageBox({ message, isBot }: Props) {
  return (
    <div className={classes.messageBox}>
      <img
        className={cx(classes.kurisuAvatar, { [classes.hidden]: !isBot })}
        src={kurisuAvatar}
      />
      <div
        className={cx({
          [classes.textAlignLeft]: isBot,
          [classes.textAlignRight]: !isBot,
        })}
      >
        {typeof message === 'string' ? (
          <Markdown includeElementIndex>{message}</Markdown>
        ) : (
          message
        )}
      </div>
      <img
        className={cx(classes.rintaroAvatar, { [classes.hidden]: isBot })}
        src={rintaroAvatar}
      />
    </div>
  )
}

export default React.memo(MessageBox)
