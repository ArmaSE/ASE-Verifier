# ASE Verifier
Verification tool made specifically for Arma Sweden members for use in cooperation with the website

## Getting started
To start up the verification bot, make sure that node.js is installed and that ``npm`` can be used in your terminal/shell.
To download all necessary NPM packages, use ``npm install`` in the folder where all of the files are located. Afterwards, go to the json folder, and rename the ``conf.example.json`` file to ``conf.json``, and edit the variables. The most important variables are the ``botToken`` and the ``activity`` variables.

Change the ``botToken`` variable to a token that you have retrieved from the [Discord developer portal](https://discordapp.com/developers/). To generrate a token, create a new application, and then create a Bot account for that project, where the token can be found beneath the "Username" field. You should also change the ``activity`` variable, to a text of your choice unless you want to retain the value that is currently written there in the example configuration. For more information regarding the different variables in the configuration, please refer to the wiki (TBD)

Once the Token and the dependencies have been prepared, you are free to start the bot. You can do so by running the ``npm start`` command or by directly running ``node app.js``.

## Links
### Arma Sweden
[Arma Sweden website](http://armasweden.se) \
[Arma Sweden Discord](https://discord.gg/wkHGN2D)

### Dependencies
[Discord.js GitHub](https://github.com/hydrabolt/discord.js)\
[Discord.js Documentation](https://discord.js.org/#/docs/main/stable/general/welcome) \
[Express.js GitHub](https://github.com/expressjs/express) \
[Express.js Documentation](http://expressjs.com/en/4x/api.html)
