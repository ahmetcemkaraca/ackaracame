import { Fragment } from 'react';

interface MarqueeProps {
  items: readonly string[];
}

export const Marquee = ({ items }: MarqueeProps) => (
  <div className="marquee" role="presentation">
    <div className="marquee__track">
      {[0, 1].map((half) => (
        <div key={half} className="marquee__item" aria-hidden={half === 1 || undefined}>
          {items.map((label) => (
            <Fragment key={`${half}-${label}`}>
              <span>{label}</span>
              <i aria-hidden="true" />
            </Fragment>
          ))}
        </div>
      ))}
    </div>
  </div>
);
