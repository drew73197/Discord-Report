Hey thanks for using my plugin!

Inside the folder labeled "Bot Files" you will find two files, reportBot.js and config.js

reportBot.js is the file you need to run to get the bot running. config.js you edit to get the bot working properly

edit reportBot.js at your own risk, config.js has details on how to fill in each part inside the file itself

This plugin is very simple it lets users type !report <username> <reason>
if a user types !report mouse hacking it will post a message in the discord notifying the admins in the channel you specify and it will give you steamID's of both the reporter and the suspect.

There is also a 5 minute cool down to prevent spam

When you create your bot application make sure to give it "Privileged Gateway Intents"

https://discordapp.com/oauth2/authorize?client_id=[BOT ID GOES HERE]&scope=bot&permissions=3088

3088 are all the permissions the bots need it allows him to read and send messages as well as manage channels to update the player count on the voice channel you assign and thats all!

Also you will need to edit the database CFG

	"reports"
	{
		"driver"			"default"
		"host"				""
		"database"			"garbage_reports"
		"user"				""
		"pass"				""
	}

If you plan on using the TF2Chat log features you will need to add logaddress_add IP:PORT to the server.cfg you plan on running this with.
