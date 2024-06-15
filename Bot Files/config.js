require('dotenv').config();

module.exports = {
    steamApiKey: process.env.STEAM_API_KEY || '',
    keepReports: process.env.KEEP_REPORTS === 'true', 
    checkReportsTimer: parseInt(process.env.CHECK_REPORTS_TIMER, 10) || 30,
    ipAddress: process.env.IP_ADDRESS || '',
    port: parseInt(process.env.PORT, 10) || 8006,
    rconHost: process.env.RCON_HOST || '',
    rconPort: parseInt(process.env.RCON_PORT, 10) || 27015,
    rconPassword: process.env.RCON_PASSWORD || '',
    tableName: process.env.TABLE_NAME || 'sb_reports',
    reportDBConfig: {
        connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT, 10) || 10,
        host: process.env.DB_HOST || '',
        user: process.env.DB_USER || '',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || ''
    },
    discordServerID: process.env.DISCORD_SERVER_ID || '',
    discordToken: process.env.DISCORD_TOKEN || '',
    reportChannel: process.env.REPORT_CHANNEL || '',
    updateVoiceChannelEnabled: process.env.UPDATE_VOICE_CHANNEL_ENABLED === 'true',
    serverCountChannel: process.env.SERVER_COUNT_CHANNEL || '',
    tf2chatEnabled: process.env.TF2CHAT_ENABLED === 'true',
    tf2chatChannel: process.env.TF2CHAT_CHANNEL || '',
    adminChatChannel: process.env.ADMIN_CHAT_CHANNEL || '',
    logAdminMessages: process.env.LOG_ADMIN_MESSAGES === 'true',
    adminLogChannel: process.env.ADMIN_LOG_CHANNEL || '',
    timeZoneCon: process.env.TIME_ZONE_CON || 'America/New_York'
};
