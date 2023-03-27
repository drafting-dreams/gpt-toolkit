import classes from './DoubleIcon.module.scss'
import type { IconType } from 'react-icons/lib'

function DoubleIcon({ Icon }: { Icon: IconType }) {
  return (
    <div className={classes.container}>
      <Icon className={classes.icon} />
      <Icon className={classes.shadowIcon} />
    </div>
  )
}

export default DoubleIcon
