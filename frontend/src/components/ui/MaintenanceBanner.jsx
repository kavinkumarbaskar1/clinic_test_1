/* eslint-disable react/prop-types */
import Banner from './Banner.jsx';

export default function MaintenanceBanner({
  message,
  title = 'Online scheduling is temporarily unavailable.',
}) {
  return (
    <Banner eyebrow="Scheduled maintenance" title={title} tone="warning">
      <p>{message}</p>
    </Banner>
  );
}
