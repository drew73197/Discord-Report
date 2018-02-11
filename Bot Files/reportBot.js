const Discord = require('discord.js');
var SteamIDMaker = require('steamid');
var dateFormat = require('dateformat');
var request = require("request");
const client = new Discord.Client();
var config = require('./config.js');
var mysql      = require('mysql');
var reportDB = mysql.createConnection({
  host     : config.host,
  user     : config.user,
  password : config.password,
  database : config.database
});
var reportsDB = config.reportsDB;
var channelName = config.channelName;
var blockedDB = config.blockedDB;
var commandStr = config.commandStr;
var SBconnected = false;
var SteamAPIKey = config.SteamAPIKey;

var guild;
var admin;
var channelReport;
var admins = config.admins;
var blocked = [];

function isAdmin(user) {

	if (admin.members.exists('user',user) || admins.indexOf(user.id) >= 0) {
		return true;
	} 
	return false;
}
function isBlocked(ID) {
	ID = ID.getSteamID64().toString();
	for (var i = blocked.length - 1; i >= 0; i--) {
		if (blocked[i].steam_id == ID) {
			return true;
		}
	}
	return false;
}
client.on('ready', () => {
	guild = client.guilds.find("id",config.serverID);
	admin = guild.roles.find("name", config.adminRole);
	channelReport = client.channels.find("name",channelName);
	
	reportDB.connect(function(err) {
		if (err) {
			channelReport.send("Couldn't connect to the database :(");
			process.exit(1);
		}
		SBconnected = true;
	});
	refreshBlocked();
	console.log("Bot ready!");
});
function refreshBlocked() {
	reportDB.query(`SELECT * FROM ${blockedDB}`, function(error, results, fields){
		if (!error) {
			blocked = results;
		}
	});
}

setInterval(function() {
	if(SBconnected) {
		reportDB.query(`SELECT * FROM ${reportsDB} WHERE sent = 0`, function (error, results, fields) {
		  if (error) throw error;
		  for (var i = results.length - 1; i >= 0; i--) {
		  	var SteamID = new SteamIDMaker(results[i].reporter_id);
		  	reportDB.query(`UPDATE ${reportsDB} SET sent = 1 WHERE id = ${results[i].id}`);
		  	if (!isBlocked(SteamID)) {
			  	var serverName = results[i].server_name;
			  	var ipPort = results[i].ip_port;
			  	var reporterName = results[i].reporter;
			  	var reporterID = results[i].reporter_id;
			  	var suspectName = results[i].suspect;
			  	var suspectID = results[i].suspect_id;
			  	var reason = results[i].reason;
			  	var dateOf = results[i].dateOf;
			  	if (suspectName != null) {
			  		channelReport.send(`**New Report!** ${admin}\n**Server**: ${serverName}\n**Connect**: steam://connect/${ipPort}\n**Date**: ${dateOf}\n**Reporter**: ${reporterName}\n**SteamID**: https://rep.tf/${reporterID} ${reporterID}\n**Suspect**: ${suspectName}\n**SteamID**: https://rep.tf/${suspectID} ${suspectID}\n**Reason**: ${reason}`);
			  	} else {
			  		channelReport.send(`**New Report!** ${admin}\n**Server**: ${serverName}\n**Connect**: steam://connect/${ipPort}\n**Date**: ${dateOf}\n**Reporter**: ${reporterName}\n**SteamID**: https://rep.tf/${reporterID} ${reporterID}\n**Reason**: ${reason}`);
			  	}
		  	}
		}
		});
	}
}, 5000);


client.on('message', message => {
	var user = message.author;
	if (message.channel == channelReport && isAdmin(user)) {
		if(message.content.startsWith(commandStr + "block")) {
			var SteamID = message.content.split(' ')[2];
			var error = false;
			try {
				SteamID = new SteamIDMaker(SteamID);
				SteamID.getSteam2RenderedID();
			} catch(err) {
				error = true;
				channelReport.send("SteamID wrong format!");
			}
			if (!error) {
				reportDB.query(`INSERT INTO ${blockedDB} (steam_id) VALUES ("${SteamID.getSteamID64()}")`, function(error, output, fields){
					if (!error) {
						var url = `http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${SteamAPIKey}&steamids=${SteamID.getSteamID64()}`;
						request({
								url: url,
								json: true
							}, function (error, response, body) {
							if(error) {
								logError(error,true);
							} else {
								channelReport.send(`Successfully blocked ${body.response.players[0].personaname} from sending reports!`);
							}
						});
					} else {
						var url = `http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${SteamAPIKey}&steamids=${SteamID.getSteamID64()}`;
						request({
								url: url,
								json: true
							}, function (error, response, body) {
							if(error) {
								logError(error,true);
							} else {
								channelReport.send(`${body.response.players[0].personaname} is already blocked!`);
							}
						});
					}
				});
			}
			refreshBlocked();
		}
		else if (message.content.startsWith(commandStr+"unblock")){
			var SteamID = message.content.split(' ')[2];
			var error = false;
			try {
				SteamID = new SteamIDMaker(SteamID);
				SteamID.getSteam2RenderedID();
			} catch(err) {
				error = true;
				channelReport.send("SteamID wrong format!");
			}
			if (!error) {
				reportDB.query(`DELETE FROM vc_blocked WHERE steam_id = "${SteamID.getSteamID64()}"`, function(error, output, fields) {
					if (!error) {
						var url = `http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${SteamAPIKey}&steamids=${SteamID.getSteamID64()}`;
						request({
								url: url,
								json: true
							}, function (error, response, body) {
							if(error) {
								logError(error,true);
							} else {
								channelReport.send(`Successfully unblocked ${body.response.players[0].personaname} from sending reports!`);
							}
						});
					} else {
						var url = `http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${SteamAPIKey}&steamids=${SteamID.getSteamID64()}`;
						request({
								url: url,
								json: true
							}, function (error, response, body) {
							if(error) {
								logError(error,true);
							} else {
								channelReport.send(`${body.response.players[0].personaname} isn't blocked!`);
							}
						});
					}
				});
			}
		}
		refreshBlocked();
	} 
});

var filterInt = function(value) {
  if (/^(\-|\+)?([0-9]+|Infinity)$/.test(value))
    return Number(value);
  return null;
}


client.login(config.token);
