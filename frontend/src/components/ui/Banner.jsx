/* eslint-disable react/prop-types */
export default function Banner({
  actions = null,
  children,
  className = '',
  eyebrow = '',
  title,
  tone = 'info',
}) {
  const classes = ['ui-banner', `ui-banner-${tone}`, className].filter(Boolean).join(' ');

  return (
    <section className={classes}>
      <div>
        {eyebrow && <p className="ui-eyebrow">{eyebrow}</p>}
        <h2>{title}</h2>
        {children}
      </div>
      {actions && <div className="ui-banner-actions">{actions}</div>}
    </section>
  );
}
