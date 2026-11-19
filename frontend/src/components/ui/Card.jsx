/* eslint-disable react/prop-types */
export default function Card({
  actions = null,
  children,
  className = '',
  eyebrow = '',
  title = '',
  tone = 'default',
}) {
  const classes = ['ui-card', `ui-card-${tone}`, className].filter(Boolean).join(' ');

  return (
    <section className={classes}>
      {(eyebrow || title || actions) && (
        <div className="ui-card-header">
          <div>
            {eyebrow && <p className="ui-eyebrow">{eyebrow}</p>}
            {title && <h2>{title}</h2>}
          </div>
          {actions && <div className="ui-card-actions">{actions}</div>}
        </div>
      )}
      <div className="ui-card-body">{children}</div>
    </section>
  );
}
