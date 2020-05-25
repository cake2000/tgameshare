/* eslint object-shorthand: [2, "consistent"]*/
import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

export default function () {
  Meteor.methods({
    'language.setDefaultLanguage'(userId, languageName) {
      check(userId, String);
      check(languageName, String);
      const user = Meteor.users.findOne({ _id: userId });
      if (!user) {
        throw Meteor.Error('User is not found');
      }
      // if current default language is the same, return
      if (user.defaultLanguage === languageName) return 0;

      return Meteor.users.update({
        _id: userId
      }, {
        $set: {
          defaultLanguage: languageName,
        },
      });
    },
    'language.setLanguageLevel'(userId, languageName, languageLevel) {
      check(userId, String);
      check(languageName, String);
      check(languageLevel, String);
      const user = Meteor.users.findOne({ _id: userId });
      if (!user) {
        throw Meteor.Error('User is not found');
      }
      return Meteor.users.update({
        _id: userId,
        'languages.name': languageName
      }, {
        $set: {
          'languages.level': languageLevel,
        },
      });
    },
    'language.addSkills'(userId, languageName, skills) {
      check(userId, String);
      check(languageName, String);
      check(skills, Array);
      const userObj = Meteor.users.findOne({ _id: Meteor.userId() });
      if (!("languages" in userObj) || !userObj.languages) userObj.languages = [];

      const filtered = userObj.languages.filter(l => l.name === languageName);

      if (filtered && filtered.length > 0) {

        const newLan = userObj.languages;
        for (let k=0; k<newLan.length; k++) {
          if (newLan[k].name == languageName) {
            const langObj = newLan[k];
            if (!("skills" in langObj)) langObj.skills = [];
            const skillset = new Set(langObj.skills);
            const orig = langObj.skills.length;
            skills.forEach((s) => { if (!skillset.has(s)) langObj.skills.push(s); });
            // if no new skills added, return
            if (orig === langObj.skills.length) return;
            return Meteor.users.update({
              _id: Meteor.userId(),
              // 'languages.name': languageName
            }, {
              $set: { languages: newLan }
            });
        
            return;
          }
        }


        // const langObj = filtered[0];
        // if (!("skills" in langObj)) langObj.skills = [];
        // const skillset = new Set(langObj.skills);
        // const orig = langObj.skills.length;
        // skills.forEach((s) => { if (!skillset.has(s)) langObj.skills.push(s); });
        // // if no new skills added, return
        // if (orig === langObj.skills.length) return 0;
        // return Meteor.users.update({
        //   _id: Meteor.userId(),
        //   'languages.name': languageName
        // }, {
        //   $set: { 'languages.$.skills': langObj.skills }
        // });
      } else {
        const newObj = { name: languageName, level: '', skills: skills };
        return Meteor.users.update({
          _id: Meteor.userId()
        }, { $addToSet: { languages: newObj } });
      }
    },
  });
}
