const config = require('./config.js');
const FS = require('fs');
const Rcon = require('rcon-srcds').default;
var dgram = require('dgram');
const util = require('util');
const SteamID = require('steamid');
const mysql = require('mysql');
const { Client, GatewayIntentBits } = require('discord.js');
const mainLogFile = FS.createWriteStream('./Logs/discordMain.log', { flags: 'a' });
const errorLogFile = FS.createWriteStream('./Logs/discordError.log', { flags: 'a' });
const rconLog = FS.createWriteStream('./Logs/rcon.log', { flags: 'a' });

const {
		keepReports,
		checkReportsTimer,
    ipAddress,
    port,
    rconHost,
    rconPort,
    rconPassword,
    tableName,
    reportDBConfig,
    discordServerID,
    discordToken,
    reportChannel,
    updateVoiceChannelEnabled,
		serverCountChannel,
    tf2chatEnabled,
    tf2chatChannel,
    adminChatChannel,
    logAdminMessages,
    adminLogChannel,
    timeZoneCon
} = config;

const originalConsoleLog = console.log;
const originalConsoleError = console.error;

var server = dgram.createSocket('udp4');
let roleNames = ['@everyone', '@here'];

const rcon = new Rcon({ host: rconHost, port: rconPort });

const dbConnection = mysql.createPool(reportDBConfig);

console.log = function () {
    const timestamp = getTimestamp(); // Get the current timestamp
    const message = util.format.apply(null, arguments); // Format all arguments as a string
    mainLogFile.write(timestamp + " " + message + '\n'); // Write to the log file with timestamp
    originalConsoleLog.apply(console, [timestamp + " " + message]); // Print to console with timestamp
};

console.error = function () {
    const timestamp = getTimestamp(); // Get the current timestamp
    const message = util.format.apply(null, arguments); // Format all arguments as a string
    errorLogFile.write(timestamp + " " + message + '\n'); // Write to the log file with timestamp
    originalConsoleError.apply(console, [timestamp + " " + message]); // Print to console with timestamp
};

const discordClient = new Client({
  intents: [        
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ]
});
discordClient.login(discordToken);
if (updateVoiceChannelEnabled) {
	setInterval(updateVoiceChannelName, 5 * 60 * 1000);
}
if (tf2chatEnabled) {
	authenticateRcon()
	setInterval(authenticateRcon, 5 * 60 * 1000);
}

if (tf2chatEnabled || updateVoiceChannelEnabled) {
    server.bind(port, ipAddress);
	server.on('listening', function () {
        var address = server.address();
        console.log('UDP Server listening ' + address.address + ':' + address.port);
	});
	server.on('message', async function (message, rinfo) {
    try {
        var logMessage = message.toString('ascii');
        if(logMessage.includes('say')) {
            const chatChannelSend = discordClient.channels.cache.get(tf2chatChannel);
            const adminChannel = discordClient.channels.cache.get(adminChatChannel)
            const steamIDMatch = logMessage.match(/<(\d+)><\[U:1:(\d+)]>/);
            const messageText = logMessage.match(/say "(.*?)"/);
            const usernameMatch = logMessage.match(/"([^"]+)<\d+><\[U:1:\d+]><(Red|Blue)>"/);
            if(steamIDMatch !== null && messageText !== null && usernameMatch !== null){
                const userServerID = steamIDMatch[1];
                const steamIDText = '[U:1:' + steamIDMatch[2] + ']' || null;
                const messageFromUser = messageText[1];
                const username = usernameMatch[1];
                const color = usernameMatch[2] || "Unassigned";
                const discordChatMessage = createMessageEmbed(color, username, messageFromUser)
                let containsRole = false;
                for (const roleName of roleNames) {
                    // Check if logMessage contains the role name
                    if (logMessage.toLowerCase().includes(roleName.toLowerCase())) {
                        containsRole = true;
                        break; // Exit the loop if a role name is found
                    }
                }
                if(!containsRole){
                    chatChannelSend.send(discordChatMessage);
                    adminChannel.send(discordChatMessage);
                }
            }
        }
    } catch (error) {
        console.error(error);
    }
});
}

discordClient.once('ready', async () => {
    console.log('Bot is ready');
    try {
        const guild = discordClient.guilds.cache.get(discordServerID);
        guild.roles.cache.each(role => {
            roleNames.push(`@${role.name}`);
        });
        const applicationCommands = await discordClient.guilds.cache.get(discordServerID).commands.fetch();
        const existingCommand = applicationCommands.find(command => command.name === 'status');

        if (!existingCommand) {
            // Create the slash command
            // const command = await discordClient.guilds.cache.get(discordServerID).commands.create({
            //     name: 'status',
            //     description: 'Get the server status since the last report',
            // });

            //console.log('Slash command "status" created:', command);
        } else {
            //console.error('Slash command "status" already exists:', existingCommand);
        }
    } catch (error) {
        console.error('Error creating slash command:', error);
    }
    if (updateVoiceChannelEnabled) {
    	updateVoiceChannelName();
  	}
});

discordClient.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) return;

    const { commandName } = interaction;

    // if (commandName === 'status') {
    //     if (interaction.channelId !== reportChannel) {
    //         await interaction.reply('This command can only be used in the bot-reports Admin channel.');
    //         return;
    //     }
    //     await sendDiscordResponseInChunks(interaction,serverStatus);
    // }
});

// Event listener for when a message is received
discordClient.on('message', async message => {
    // Get the channels by ID
    // const channelToSend = discordClient.channels.cache.get(reportChannel);

    // // Check if the message is from the channel to read and not from the bot itself
    // if (message.channel.id === reportChannel && !message.author.bot) {
    //     if(message == "!test") {
    //     	channelToSend.send("test");
    //     }
    // }
});

function createMessageEmbed(color, username, message) {
    let embedColor;
    // Set embed color based on the team color
    switch (color) {
        case 'Red':
            embedColor = 0xFF0000; // Red
            break;
        case 'Blue':
            embedColor = 0x0000FF; // Blue
            break;
        default:
            embedColor = 0x808080; // Default to white for spec
    }

    const embed = {
        embeds: [{
            color: embedColor,
            description: `**${username}:** ${message}`
        }]
    };
    return embed;
}

discordClient.on('messageCreate', async (message) => {
    if (message.channel.id === adminChatChannel && message.guild.id === discordServerID && tf2chatEnabled) {
        if (!message.author.bot) {
            if (logAdminMessages) {
                const adminLog = discordClient.channels.cache.get(adminLogChannel);
                adminLog.send(`${message.author.toString()}: ${message.content}`);
            }
            const rconMessage = `sm_say ${message.member.displayName}: ${message.content}`;
            run_rcon(rconMessage);
        }
    }
});

async function updateVoiceChannelName() {
    const channel = discordClient.channels.cache.get(serverCountChannel);
    if (!channel) return console.error('Channel not found.');

    rcon.execute('status')
                .then((response) => {
                    const lines = response.split('\n');
                    let foundStart = false;
                    let formattedMessage = '';
                    for (const line of lines) {
                        if (!foundStart) {
                            // Check if the line starts with a key-value pair indicator (e.g., "hostname:")
                            if (/^\w+\s*:/.test(line)) {
                                foundStart = true;
                            }
                        }
                        if (foundStart) {
                            formattedMessage += `${line}\n`;
                        }
                    }

                    const humanPlayersRegex = /players\s*:\s*(\d+)\s*humans/;

                    // Match the pattern in the text string and extract the number of human players
                    const match = response.match(humanPlayersRegex);

                    // Extract the number of human players from the captured group
                    const humanPlayers = match ? parseInt(match[1]) : null;

                    channel.setName(`Players: ${humanPlayers}`)
                        .then(updatedChannel => console.log(`Updated channel name to: ${updatedChannel.name}`))
                        .catch(console.error);

                })
                .catch((error) => {
                    console.error('Error fetching chat messages:', error);
                });

}



async function run_rcon(command) {
    rcon.execute(command) // Execute a command to get the status and chat messages
                .then((response) => {
                    const timestamp = getTimestamp();
                    rconLog.write(`${timestamp} - ${response}\n`);
                })
                .catch((error) => {
                    console.error('Error fetching chat messages:', error);
                });
}

function authenticateRcon(attempt = 1) {
    rcon.authenticate(rconPassword)
        .then(() => {
            console.log('Successfully connected and authenticated to TF2 server via RCON');
        })
        .catch(error => {
            // Only retry if the error is not "Already authenticated"
            if (!error.message.includes("Already authenticated")) {
                
                // Retry logic, with a limit on the number of attempts
                if (attempt < 3) {
                    console.log('Attempting to re-authenticate...');
                    setTimeout(() => authenticateRcon(attempt + 1), 1000); // Wait 1 second before retrying
                } else {
                    console.error('Maximum re-authentication attempts reached.');
                }
            }
        });
}

function getTimestamp() {
    const now = new Date();
    return `${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getDate().toString().padStart(2, '0')}/${now.getFullYear().toString().slice(-2)} ${now.getHours() % 12 || 12}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')} ${now.getHours() >= 12 ? 'PM' : 'AM'}`;
}

const checkAndFormatReports = () => {
    const query = `SELECT id, server_name, reporter, reporter_id, suspect, suspect_id, reason, dateOf FROM ${tableName} WHERE sent = 0`;
    queryDatabase(query)
    .then(results => {
        if (results.length === 0) {
            console.log("No reports to process.");
        }

        results.forEach(report => {
            const formattedMessage = formatReportMessage(report);
            console.log(formattedMessage);
            const reportChannelSend = discordClient.channels.cache.get(reportChannel);
            reportChannelSend.send(formattedMessage);
        });

        // Update 'sent' status in the database if necessary
        if (results.length > 0) {
            markReportsAsSent(results.map(report => report.id));
        }
        return results;
    })
    .catch(error => {
        console.error('Failed to query reports:', error);
        return error;
    });
};

const formatReportMessage = (report) => {
    // Parse the dateOf string to a Date object
    let date = new Date(report.dateOf);

    // Add 3 hours to the date
    date.setHours(date.getHours() + 2);

    // Format the date to a more readable format, specify the time zone to EST
    const formattedDate = date.toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
        timeZone: timeZoneCon // EST time zone
    });

    // Construct the message with the formatted date
    return `@here
        **Report ID:** ${report.id}
        **Server:** ${report.server_name}
        **Reporter:** [${report.reporter}](https://rep.tf/${new SteamID(report.reporter_id).getSteamID64()}) (ID: ${report.reporter_id})
        **Suspect:** [${report.suspect}](https://rep.tf/${new SteamID(report.suspect_id).getSteamID64()}) (ID: ${report.suspect_id})
        **Reason:** ${report.reason}
        **Date of Report:** ${formattedDate}
    `;
};


const markReportsAsSent = (reportIds) => {
    let query;
    if (keepReports) {
        query = `UPDATE ${tableName} SET sent = 1 WHERE id IN (${reportIds.join(',')})`;
    } else {
        query = `DELETE FROM ${tableName} WHERE id IN (${reportIds.join(',')})`;
    }
    return queryDatabase(query)  
        .then(results => {
            console.log(results);
            return results;
        })
        .catch(error => {
            console.error("Failed to mark reports as sent:", error);
            throw error;
        });
}


function queryDatabase(sql) {
    return new Promise((resolve, reject) => {
        dbConnection.query(sql, (err, results) => {
            if (err) reject(err);
            else resolve(results);
        });
    });
}

setInterval(checkAndFormatReports, checkReportsTimer * 1000); // 30000 milliseconds = 30 seconds