const adminEnums = {
  TYPES: {
    HOME_PAGE: 'homepage',
    GENERAL: 'general'
  },
  HOME_PAGE: {
    ACCOUNT_TYPES: {
      AI: 'ai',
      MANUAL: 'manual',
      ARRAY_OBJECT: [
        {
          key: 'ai',
          value: 'Robot Account'
        },
        {
          key: 'manual',
          value: 'Human Account'
        }
      ]
    }
  },
  LESSON_LEVEL: {
    STARTED: 'started',
    INTERMEDIATE: 'advanced',
    ARRAY_OBJECT: [
      {
        key: 'starter',
        value: 'Starter Tutorial'
      },
      {
        key: 'advanced',
        value: 'Intermediate Tutorials'
      }
    ]
  },
  LESSON_DIFFICULTY: {
    ARRAY_OBJECT: [
      {
        key: 1,
        value: 'One star'
      },
      {
        key: 2,
        value: 'Two stars'
      },
      {
        key: 3,
        value: 'Three stars'
      },
      {
        key: 4,
        value: 'Four stars'
      },
      {
        key: 5,
        value: 'Five stars'
      }
    ],
    ONE: 1,
    TWO: 2,
    THREE: 3,
    FOUR: 4,
    FIVE: 5
  }

};

export default adminEnums;
