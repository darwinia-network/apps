import { format } from 'date-fns';
import { SegmentedType } from '../../model';
import { ONE_DAY_IN_MILLISECOND, DATE_FORMAT } from '../../config';

export const getSegmentedDateByType = (type: SegmentedType) => {
  const valueEarly = format(new Date('1970-01-01'), DATE_FORMAT);

  switch (type) {
    case SegmentedType.ALL:
      return valueEarly;
    case SegmentedType.L7D:
      // eslint-disable-next-line no-magic-numbers
      return format(new Date(Date.now() - ONE_DAY_IN_MILLISECOND * 7), DATE_FORMAT);
    case SegmentedType.L30D:
      // eslint-disable-next-line no-magic-numbers
      return format(new Date(Date.now() - ONE_DAY_IN_MILLISECOND * 30), DATE_FORMAT);
    default:
      return valueEarly;
  }
};
