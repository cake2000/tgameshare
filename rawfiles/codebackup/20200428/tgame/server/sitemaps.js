/* global sitemaps */

sitemaps.add('/sitemap.xml', (req) => {
  let host = Meteor.absoluteUrl();
  if (req && req.headers && req.headers.host) {
    host = `https://${req.headers.host}/`;
  }
  // required: page
  // optional: lastmod, changefreq, priority, xhtmlLinks, images, videos
  return [
    { page: `${host}notify`, lastmod: new Date().getTime() },
    { page: `${host}selectRole`, lastmod: new Date().getTime() },
    { page: `${host}signin`, lastmod: new Date().getTime() },
    { page: `${host}signup`, lastmod: new Date().getTime() },
    { page: `${host}tutorialLinks`, lastmod: new Date().getTime() },
    { page: `${host}gamesBoard/`, lastmod: new Date().getTime() },
    { page: `${host}buildMyAI/`, lastmod: new Date().getTime() },
    { page: `${host}gamesRoomEntry/`, lastmod: new Date().getTime() },
    { page: `${host}tournament/`, lastmod: new Date().getTime() },
    { page: `${host}gamesRoomTournamentNetwork/`, lastmod: new Date().getTime() },
    { page: `${host}verify-email/`, lastmod: new Date().getTime() },
    { page: `${host}forgot-password`, lastmod: new Date().getTime() },
    { page: `${host}reset-password/`, lastmod: new Date().getTime() },
    { page: `${host}my-account`, lastmod: new Date().getTime() },
    { page: `${host}support`, lastmod: new Date().getTime() },
    { page: `${host}forum`, lastmod: new Date().getTime() },
    { page: `${host}topic`, lastmod: new Date().getTime() },
    { page: `${host}guide`, lastmod: new Date().getTime() },
    { page: `${host}player`, lastmod: new Date().getTime() },
    { page: `${host}tournament-introduce`, lastmod: new Date().getTime() },
    { page: `${host}invitationLogs`, lastmod: new Date().getTime() },
    { page: `${host}teacher`, lastmod: new Date().getTime() },
    { page: `${host}gamesRoomNetwork`, lastmod: new Date().getTime() },
    { page: `${host}section-info`, lastmod: new Date().getTime() },
    { page: `${host}resend-verification`, lastmod: new Date().getTime() },
    { page: `${host}leaderboard`, lastmod: new Date().getTime() },
    { page: `${host}manual`, lastmod: new Date().getTime() },
    { page: `${host}manual-detail`, lastmod: new Date().getTime() },
    { page: `${host}about`, lastmod: new Date().getTime() },
    { page: `${host}privacy`, lastmod: new Date().getTime() },
    { page: `${host}terms`, lastmod: new Date().getTime() },
    { page: `${host}contact-us`, lastmod: new Date().getTime() },
    { page: `${host}class`, lastmod: new Date().getTime() },

    // { page: `${host}blog`, lastmod: new Date().getTime() },
    // { page: `${host}playgame/`, lastmod: new Date().getTime() }
    // https://support.google.com/webmasters/answer/178636?hl=en
  ];
});
