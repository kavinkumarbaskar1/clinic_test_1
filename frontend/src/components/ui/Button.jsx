/* eslint-disable react/prop-types */
const styles = ['primary', 'secondary', 'ghost', 'danger'];
const sizes = ['sm', 'md', 'lg'];

export default function Button({
  children,
  className = '',
  size = 'md',
  type = 'button',
  variant = 'primary',
  ...props
}) {
  const buttonVariant = styles.includes(variant) ? variant : 'primary';
  const buttonSize = sizes.includes(size) ? size : 'md';
  const classes = [
    'ui-button',
    `ui-button-${buttonVariant}`,
    `ui-button-${buttonSize}`,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button className={classes} type={type} {...props}>
      {children}
    </button>
  );
}
