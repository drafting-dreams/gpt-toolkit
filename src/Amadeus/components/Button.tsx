import cx from 'classnames'
import classes from './Button.module.scss'
import type { HTMLProps } from 'react'

function Button({
  children,
  className,
  type,
  ...rest
}: HTMLProps<HTMLButtonElement>) {
  return (
    <button type='button' className={cx(className, classes.button)} {...rest}>
      {children}
    </button>
  )
}

export default Button
