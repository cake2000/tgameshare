import { Persons } from '/lib/collections';
import { USER_TYPES } from '../../../lib/enum';

const prepareSupporter = () => {
  Persons.update(
    { userId:  {$in: ['kEmnDrYssC2gKNDxx', 'Zzcy3d42JamfLc7kF', 'ScDM5NzhdHgyyHsYw'] } },
    {
      $addToSet: {
        type: USER_TYPES.SUPPORTER
      }
    }
  );
};

export default prepareSupporter;
