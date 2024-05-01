// config.js
module.exports = {
    keepReports: true, // Determines whether to keep reports after processing or delete them
    checkReportsTimer: 30, // Interval in seconds to check for new reports
    ipAddress: '', // IP address the UDP server will bind to (if applicable)
    port: 8006, // Port number for the UDP server
    rconHost: '', // Hostname for RCON server connection
    rconPort: 27015, // Port number for RCON server connection
    rconPassword: '', // Password for RCON server authentication
    tableName: 'sb_reports', // The name of the database table for storing reports
    reportDBConfig: { // Database configuration for the reports
        connectionLimit: 10, // Maximum number of connections in the database pool
        host: '', // Database server host
        user: '', // Database user
        password: '', // Database password
        database: '' // Database name
    },
    discordServerID: '', // Discord server ID for bot interaction
    discordToken: '', // Token for authenticating the Discord bot
    reportChannel: '', // Discord channel ID for reporting messages
    updateVoiceChannelEnabled: true, // Toggle for updating Discord voice channel names based on server status
    serverCountChannel: '', // Discord voice channel ID to display player count
    tf2chatEnabled: true, // Toggle for Team Fortress 2 chat integration
    tf2chatChannel: '', // Discord channel ID for TF2 chat messages
    adminChatChannel: '', // Discord channel ID for admin messages
    logAdminMessages: true, // Toggle for logging admin messages to a specific channel
    adminLogChannel: '', // Discord channel ID where admin logs are sent
    timeZoneCon: 'America/New_York' // Time zone configuration for report timestamps
};
