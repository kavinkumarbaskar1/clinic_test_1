/* eslint-disable react/prop-types */
const toneLabels = {
  default: 'Status',
  good: 'Ready',
  warning: 'Needs attention',
  critical: 'Critical',
  neutral: 'Neutral',
};

export default function Tag({
  children,
  className = '',
  tone = 'default',
}) {
  const classes = ['ui-tag', `ui-tag-${tone}`, className].filter(Boolean).join(' ');
  const label = toneLabels[tone] ?? toneLabels.default;

  return (
    <span className={classes} aria-label={`${label}: ${children}`}>
      {children}
    </span>
  );
}
