import { Random } from 'meteor/random';
import stripePackage from 'stripe';
import { Games, StripeCustomer, Persons } from '../../../lib/collections';
import { ROLES, PAYMENT_PLANS } from '../../../lib/enum';

const stripe = stripePackage(Meteor.settings.private.stripe.liveSecretKey);

const createStripeCustomer = (userId, accountType) => {
  stripe.customers.create(
    {
      description: `Stripe Customer for user ${userId}`,
    }
  ).then(Meteor.bindEnvironment((customer) => {
    Meteor.users.update(
      { _id: userId }, {
        $set: {
          stripeCusId: customer.id
        }
      }
    );
    StripeCustomer.insert({
      userId,
      data: {
        customer
      }
    });
    return stripe.subscriptions.create({
      customer: customer.id,
      items: [
        {
          plan: accountType === ROLES.AI ? PAYMENT_PLANS.FREE_ROBOT : PAYMENT_PLANS.FREE_HUMAN,
        },
      ]
    });
  })).catch((err) => {
    console.log(err);
  });
};

const addStripeToUser = (userId, customer) => {
  Meteor.users.update(
    {
      _id: userId
    },
    {
      $set: {
        stripeCusId: customer.id
      }
    }
  );
  StripeCustomer.insert({
    userId,
    data: {
      customer
    }
  });
};

const prepareDefaultUser = () => {
  Meteor.users.remove({});

  const games = Games.find().fetch();
  const playGames = games.map(game => ({
    gameId: game._id,
    rating: 300,
    tournamentIds: []
  }));

  const manual =
  {
    _id: 'ZmjDvnCJKvA678ZDW',
    createdAt: new Date(),
    accountType: PAYMENT_PLANS.FREE_HUMAN,
    services: {
      password: {
        bcrypt: '$2a$10$Hh92arvtlgUClitxfr9oAe.W.SHCuABeCqpb4177wLCuiyvEybRlq'
      },
      email: {
        verificationTokens: []
      },
      resume: {
        loginTokens: [
          {
            when: new Date(),
            hashedToken: 'S7cb9dH7Tni27gQHf0RUWoEKm8lsw9jEU+rhEDgzJwU='
          }
        ]
      }
    },
    emails: [
      {
        address: 'manual@mail.com', // password 123456789
        verified: true
      }
    ],
    roles: [
      ROLES.MANUAL
    ],
    username: 'manual',
    profile: {
      firstName: 'Manual',
      lastName: 'User',
      zipcode: '00611',
      grade: 4,
      gender: 'Male',
    },
    playGames: playGames.map(game => ({ ...game, rating: Math.floor(Math.random() * (501)) }))
  };

  const ai = {
    _id: 'kEmnDrYssC2gKNDxx',
    createdAt: new Date(),
    accountType: PAYMENT_PLANS.FREE_ROBOT,
    services: {
      password: {
        bcrypt: '$2a$10$0dlG6eQnOv.okZ/hgenVQejmmoVkV0GCn/FLbECb6bSMUlHxb4oX6'
      },
      email: {
        verificationTokens: []
      },
      resume: {
        loginTokens: [
          {
            when: new Date(),
            hashedToken: '2YpSGxXu+2E1yooUPibUxRYLLld6ZsOUm+nLAzm+cUc='
          }
        ]
      }
    },
    emails: [
      {
        address: 'ai@mail.com',
        verified: true
      }
    ],
    roles: [
      ROLES.AI
    ],
    username: 'AlphaPool',
    profile: {
      firstName: 'Alpha',
      lastName: 'Pool',
      zipcode: '00612',
      grade: 12,
      gender: 'Female',
    },
    tutorial: [],
    playGames: playGames.map(game => ({ ...game, rating: Math.floor(Math.random() * (501)) }))
  };

  // const tgame = {
  //   _id: 'kEmnDrYssC2gKNTTx',
  //   createdAt: new Date(),
  //   accountType: PAYMENT_PLANS.FREE_ROBOT,
  //   services: {
  //     password: {
  //       bcrypt: '$2a$10$0dlG6eQnOv.okZ/hgenVQejmmoVkV0GCn/FLbECb6bSMUlHxb4oX6'
  //     },
  //     email: {
  //       verificationTokens: []
  //     },
  //     resume: {
  //       loginTokens: [
  //         {
  //           when: new Date(),
  //           hashedToken: '2YpSGxXu+2E1yooUPibUxRYLLld6ZsOUm+nLAzm+cTc='
  //         }
  //       ]
  //     }
  //   },
  //   emails: [
  //     {
  //       address: 'tgame@mail.com',
  //       verified: true
  //     }
  //   ],
  //   roles: [
  //     ROLES.AI
  //   ],
  //   username: 'TGame',
  //   profile: {
  //     age: 30
  //   },
  //   tutorial: [],
  //   playGames
  // };

  const bi = {
    _id: 'kEmnDrYssC2gKNDxy',
    createdAt: new Date(),
    accountType: PAYMENT_PLANS.FREE_ROBOT,
    services: {
      password: {
        bcrypt: '$2a$10$0dlG6eQnOv.okZ/hgenVQejmmoVkV0GCn/FLbECb6bSMUlHxb4oX6'
      },
      email: {
        verificationTokens: []
      },
      resume: {
        loginTokens: [
          {
            when: new Date(),
            hashedToken: '2YpSGxXu+2E1yooUPibUxRYLLld6ZsOUm+nLAzm+cUc+'
          }
        ]
      }
    },
    emails: [
      {
        address: 'bi@mail.com',
        verified: true
      }
    ],
    roles: [
      ROLES.AI
    ],
    username: 'BetaPool',
    profile: {
      firstName: 'Beta',
      lastName: 'Pool',
      zipcode: '01813',
      grade: 7,
      gender: 'Female'
    },
    tutorial: [],
    playGames: playGames.map(game => ({ ...game, rating: Math.floor(Math.random() * (501)) }))
  };

  const support = {
    _id: 'kEmnDrYssC2gKNDyz',
    createdAt: new Date(),
    accountType: PAYMENT_PLANS.FREE_ROBOT,
    services: {
      password: {
        bcrypt: '$2a$10$0dlG6eQnOv.okZ/hgenVQejmmoVkV0GCn/FLbECb6bSMUlHxb4oX6'
      },
      email: {
        verificationTokens: []
      },
      resume: {
        loginTokens: [
        ]
      }
    },
    emails: [
      {
        address: 'support@mail.com',
        verified: true
      }
    ],
    roles: [
      ROLES.SUPPORT
    ],
    username: 'support',
    profile: {
      firstName: 'Support',
      lastName: 'User',
      zipcode: '00619',
      grade: 1,
      gender: 'Male'
    },
    tutorial: [],
    playGames: playGames.map(game => ({ ...game, rating: Math.floor(Math.random() * (501)) }))
  };
  let userId;
  userId = Meteor.users.insert(manual);
  let personId = Persons.insert({
    userId
  });
  Meteor.users.update({ _id: userId }, { $set: { personId } });

  userId = Meteor.users.insert(ai);
  personId = Persons.insert({
    userId
  });
  Meteor.users.update({ _id: userId }, { $set: { personId } });

  userId = Meteor.users.insert(bi);
  personId = Persons.insert({
    userId
  });
  Meteor.users.update({ _id: userId }, { $set: { personId } });

  // Meteor.users.insert(tgame);
  userId = Meteor.users.insert(support);
  personId = Persons.insert({
    userId
  });
  Meteor.users.update({ _id: userId }, { $set: { personId } });

  // createStripeCustomer('ZmjDvnCJKvA678ZDW', ROLES.MANUAL);
  // createStripeCustomer('kEmnDrYssC2gKNDxx', ROLES.AI);
  // stripe.customers.retrieve('cus_BXwTO8h66aEzRc', Meteor.bindEnvironment((err, customer) => {
  //   addStripeToUser('kEmnDrYssC2gKNDxx', customer);
  //   addStripeToUser('kEmnDrYssC2gKNDxy', customer);
  //   addStripeToUser('kEmnDrYssC2gKNDyz', customer);
  // }));
  // stripe.customers.retrieve('cus_BYhAI98qmIx7J2', Meteor.bindEnvironment((err, customer) => {
  //   addStripeToUser('ZmjDvnCJKvA678ZDW', customer);
  // }));

  let testAI = null;
  for (let i = 0; i < 4; i++) {
    testAI = {
      createdAt: new Date(),
      accountType: PAYMENT_PLANS.FREE_ROBOT,
      services: {
        password: {
          bcrypt: '$2a$10$0dlG6eQnOv.okZ/hgenVQejmmoVkV0GCn/FLbECb6bSMUlHxb4oX6'
        },
        email: {
          verificationTokens: []
        },
      },
      emails: [
        {
          address: `ai${i}@mail.com`,
          verified: true
        }
      ],
      roles: [
        ROLES.AI
      ],
      username: `AI_Demo${i}`,
      profile: {
        firstName: 'AI',
        lastName: 'Demo',
        zipcode: '00112',
        grade: 5,
        gender: 'Female'
      },
      tutorial: [],
      playGames: playGames.map(game => ({ ...game, rating: Math.floor(Math.random() * (501)) }))
    };
    userId = Meteor.users.insert(testAI);
    personId = Persons.insert({
      userId
    });
    Meteor.users.update({ _id: userId }, { $set: { personId } });
  }
  let testManual = null;
  for (let i = 0; i < 4; i++) {
    testManual = {
      _id: Random.id(),
      createdAt: new Date(),
      accountType: PAYMENT_PLANS.FREE_HUMAN,
      services: {
        password: { // 123456789
          bcrypt: '$2a$10$Hh92arvtlgUClitxfr9oAe.W.SHCuABeCqpb4177wLCuiyvEybRlq'
        },
        email: {
          verificationTokens: []
        },
      },
      emails: [
        {
          address: `manual${i}@mail.com`,
          verified: true
        }
      ],
      roles: [
        ROLES.MANUAL
      ],
      username: `Manual_Demo${i}`,
      profile: {
        firstName: 'Manual',
        lastName: `Demo ${i}`,
        zipcode: '00212',
        grade: 3,
        gender: 'Male'
      },
      tutorial: [],
      playGames: playGames.map(game => ({ ...game, rating: Math.floor(Math.random() * (501)) }))
    };
    userId = Meteor.users.insert(testManual);
    personId = Persons.insert({
      userId
    });
    Meteor.users.update({ _id: userId }, { $set: { personId } });
  }
  const adminForum = {
    createdAt: new Date(),
    accountType: PAYMENT_PLANS.FREE_ROBOT,
    services: {
      password: {
        // 123456789
        bcrypt: '$2a$10$0dlG6eQnOv.okZ/hgenVQejmmoVkV0GCn/FLbECb6bSMUlHxb4oX6'
      },
      email: {
        verificationTokens: []
      },
    },
    emails: [
      {
        address: `adminforum@mail.com`,
        verified: true
      }
    ],
    roles: [
      ROLES.AI
    ],
    username: `adminforum@mail.com`,
    profile: {
      firstName: 'TGame',
      lastName: 'Official',
      zipcode: '00212',
      grade: 3,
      gender: 'Male'
    },
    tutorial: [],
    playGames: [],
  };
  userId = Meteor.users.insert(adminForum);
  personId = Persons.insert({
    userId
  });
  Meteor.users.update({ _id: userId }, { $set: { personId } });
};



export default prepareDefaultUser;
