var config = {
	admins: ["82897317803327488"], // people without the admin role that are allowed to use the bot, this is their discord ID
	serverID: "231945815575232512", // discord server ID
	host: "", // MySQL IP or hostname
	user: "admin", // MySQL username
	password: "", // MySQL password
	database: "garbage_reports", // MySQL database
	reportsDB: "reports", // MySQL report location can't really change this 
	blockedDB: "blocked", // MySQL blocked location can't really change this
	channelName: "bot-reports", // Channel the bot will post reports in, create the channel before running the bot!
	commandStr: "!ms ", // !ms block 76561198023897791
	SteamAPIKey: "", // SteamAPI Key https://steamcommunity.com/dev/api
	adminRole: "Admin", // The role name of people that should be able to use the bot
	token: "" // Bot Token
}
module.exports = config;
