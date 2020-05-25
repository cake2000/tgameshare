if (Meteor.isServer) {
  const SparkPost = {
    _options: {
      // required to send
      host: 'smtp.sparkpostmail.com',
      port: '587',
      username: 'SMTP_Injection',
      password: null,

      // optional to make sending easier
      from: 'TuringGame <support@tgame.ai>',
      subject: null,
      headers: null
    },

    config(options) {
      if (typeof options === 'object') {
        // merge options with default options
        for (const key in options) {
          if (options.hasOwnProperty(key)) { this._options[key] = options[key]; }
        }
      } else {
        this._options.password = options;
      }

      if (this._options.password === null || this._options.password.trim().length === 0) { throw new Meteor.Error('password-required', 'Password(api key) required to send email'); }
      process.env.MAIL_URL = `smtp://${this._options.username}:${this._options.password}@${this._options.host}:${this._options.port}/`;
    },

    send(options) {
      options.from = options.from || this._options.from;
      options.subject = options.subject || this._options.subject;
      options.headers = options.headers || this._options.headers;
      Meteor.defer(() => {
        Email.send(options);
      });
    }
  };

  SparkPost.config('683bd06504f4eb1359d2d5aedb7ae42b94f94ba2');
}

