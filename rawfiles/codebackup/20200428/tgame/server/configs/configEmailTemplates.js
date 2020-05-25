Accounts.emailTemplates.siteName = 'Tgame';
Accounts.emailTemplates.from = 'TuringGame <admin@tgame.ai>';

Accounts.emailTemplates.verifyEmail = {
  subject() {
    return '[TuringGame] Please verify your email';
  },
  text(user, url) {
    const emailAddress = user.emails[0].address;
    const urlWithoutHash = url.replace('#/', '');
    const supportEmail = 'tgameai@gmail.com';
    let emailTemplate = '';
    // if (user.profile.age !== 3) {
    //   emailTemplate = 'your child has signed up with TGame.ai using this email address and this password. Tgame.ai offers online games that players can play manually or create computer programs to play. The only personal information we collect about your child is his/her birthday, which is used for 2 purposes: obtain parental consent for information collection and other parental controls; grouping players by their age in tournaments. We will never directly publish your child’s birthday information, but his/her age group in tournaments may indirectly allow others to infer his/her age. If you accept our way of collecting and handling information of your child, please click the link below to confirm. You can read the full terms and agreements here.\n\n';
    // }
    emailTemplate += `To verify your email address (${emailAddress}), please click the following link:\n\n${urlWithoutHash}\n\n If you did not request this verification, please ignore this email. If you feel something is wrong, please contact our support team: ${supportEmail}.`;
    return emailTemplate;
  }
};

Accounts.emailTemplates.resetPassword.text = (user, url) => {
  const token = url.substring(url.lastIndexOf('/') + 1, url.length);
  const newUrl = Meteor.absoluteUrl(`reset-password/${token}`);
  let str = 'Hello,\n';
  str += 'To reset your password, please click follow link...\n';
  str += newUrl;
  return str;
};
