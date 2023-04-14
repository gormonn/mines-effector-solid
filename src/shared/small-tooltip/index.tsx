import SmallTooltip from 'shared/small-tooltip/lib';
import './tooltip.scss';

const smallTooltip = new SmallTooltip();
smallTooltip.init();

export const SmallToolTipPortal = () => <div id="small-tooltip" />;
