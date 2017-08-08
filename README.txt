Hey thanks for using my plugin!

As long as you configure it correctly everything should go as planned.

the config.js file should have all the info you need for setting that up.

This plugin is very simple it lets users type !report <username> <reason> or just !report <reason>
if a user types !report mouse hacking it will post a message in the discord notifying the admins in the channel you specify and it will give you steamID's of both the reporter and the suspect
if you find someone abusing the !report command you can inside of discord as long as you have admin abilities type if you have your command string set to say "!rb " you type !rb block <SteamID (any format)> and it will block them from ever sending reports again. If you want to unblock someone you type !rb unblock <SteamID (any format)>

https://discordapp.com/oauth2/authorize?client_id=[BOT ID GOES HERE]&scope=bot&permissions=3072

3072 are all the permissions the bots need it allows him to read and send messages and thats all!

Also you will need to edit the database CFG

	"reports"
	{
		"driver"			"default"
		"host"				""
		"database"			"garbage_reports"
		"user"				""
		"pass"				""
	}
