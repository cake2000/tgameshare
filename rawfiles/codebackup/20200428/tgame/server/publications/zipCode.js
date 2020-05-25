import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { ZipCode } from '../../lib/collections';

export default function () {
  Meteor.publish('LocationByZipCode', (zipCode) => {
    check(zipCode, String);
    return ZipCode.find(
      { Zipcode: zipCode },
      {
        fields: {
          Zipcode: 1,
          City: 1,
          State: 1,
          Location: 1
        }
      }
    );
  });
}
