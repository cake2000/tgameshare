import { Meteor } from 'meteor/meteor';
import { Admin, Contact, Games, Tournament, TournamentSection } from '../../lib/collections';
import { ADMIN_PUBLICATION } from '../../lib/enum';

export default function () {
  Meteor.publish('adminGetHomePageData', () => Admin.find({ type: ADMIN_PUBLICATION.TYPES.HOME_PAGE }));

  Meteor.publish('adminGeneralData', () => Admin.find({ type: ADMIN_PUBLICATION.TYPES.GENERAL }));

  Meteor.publish('adminAccountData', () => Admin.find({ type: ADMIN_PUBLICATION.TYPES.ACCOUNTS }));

  Meteor.publish('adminGetContactData', () => Contact.find());

  Meteor.publish('adminGetTournamentList', () => Tournament.find({}, { fields: {
    _id: 1,
    Name: 1
  } }));

  Meteor.publish('adminGetTournamentItem', (tournamentId) => {
    check(tournamentId, String);
    return Tournament.find({ _id: tournamentId });
  });

  Meteor.publish('adminGetGameListDropDown', () => Games.find({}, { fields: {
    _id: 1,
    title: 1
  } }));

  Meteor.publish('adminGetTournamentSections', (tournamentId) => {
    check(tournamentId, String);
    return TournamentSection.find({ tournamentId });
  });
}
