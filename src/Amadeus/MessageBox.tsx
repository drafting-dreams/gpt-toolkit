import React, { useState } from 'react'
import Markdown from 'react-markdown'
import DoubleIcon from './components/DoubleIcon'
import { MdErrorOutline } from 'react-icons/md'

import cx from 'classnames'
import classes from './MessageBox.module.scss'
import rintaroAvatar from './assets/rintaro.webp'
import kurisuAvatar from './assets/kurisu.png'

import type { ReactNode } from 'react'

type Props = {
  message: ReactNode
  isBot: boolean
  showError: boolean
  resend?: () => void
}

function MessageBox({ message, isBot, showError, resend }: Props) {
  const [showTooltip, setShowTooltip] = useState(false)

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
        {typeof message === 'string' ? (
          <Markdown includeElementIndex>{message}</Markdown>
        ) : (
          message
        )}
        {showError && (
          <div
            className={cx(classes.errorIconContainer, {
              [classes.nonClickable]: !resend,
            })}
            onClick={() => {
              if (resend) {
                resend()
                setShowTooltip(false)
              }
            }}
            onMouseEnter={() => {
              setShowTooltip(true)
            }}
            onMouseLeave={() => {
              setShowTooltip(false)
            }}
          >
            <DoubleIcon Icon={MdErrorOutline} />
            {showTooltip && (
              <div className={classes.tooltip}>{`Message not sent${
                resend ? ',\nClick to resend.' : ''
              }`}</div>
            )}
          </div>
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
