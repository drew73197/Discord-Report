#include <sourcemod>
#include <sdktools> 
#include <dbi>

public Plugin myinfo =
{
	name = "Report tool",
	author = "Reo",
	description = "Adds a report to a database",
	version = "1.0",
	url = "https://reo.tf"
};

new String:g_sHostname[100];      
new String:StatusInfo[3][100];          
 
public void OnPluginStart()
{
	RegConsoleCmd("sm_report", Command_Report);
}

public OnMapStart()
{
    // Wait a bit and then get the console status output:
    CreateTimer(4.5, GetStatus);    
}

public Action:GetStatus(Handle:Timer)
{
    decl String:Output[600];
    ServerCommandEx(Output, 600, "status");
    
    ExplodeString(Output, "\n", StatusInfo, 3, 100);
}

public Action:Command_Report(int client, int args)
{
	new Handle:tmp = FindConVar("hostname");
    GetConVarString(tmp, g_sHostname, sizeof(g_sHostname)); 
    CloseHandle(tmp);
	char error[255];
	char conf[255];
	conf = "reports"
	Database db = SQL_Connect(conf, true, error, sizeof(error));
	char SuspectName[MAX_NAME_LENGTH];
	char SuspectID[32];

	
	if (db == null)
	{
		ReplyToCommand(client,"[SM] Couldn't send your report!");
	} else {
		char arg1[32];
	 

		GetCmdArg(1, arg1, sizeof(arg1));
		char reason[256];
		int k = 0;
		if (args >= 2)
		{
			int target = FindTarget(client, arg1, true, false);
			if (target != -1)
			{
				GetClientAuthId(target, AuthId_Steam2, SuspectID, sizeof(SuspectID));
				GetClientName(target, SuspectName, sizeof(SuspectName));
				k = 1;
			} 
		} 

		for (int i = k+1; i < args+1; i++){
			char t[255];
			GetCmdArg(i, t, sizeof(t));
			StrCat(t,255," ");
			StrCat(reason, 625, t);
		}

		char ReporterName[MAX_NAME_LENGTH];
		char ReporterID[32];
		GetClientAuthId(client, AuthId_Steam2, ReporterID, sizeof(ReporterID));
		GetClientName(client, ReporterName, sizeof(ReporterName));
		char query[256];
		int buffer_len = strlen(reason) * 2 + 1;
		char[] new_reason = new char[buffer_len];
		SQL_EscapeString(db, reason, new_reason, buffer_len);

		int buffer_len2 = strlen(StatusInfo[0]) * 2 + 1;
		char[] new_servername = new char[buffer_len2];
		SQL_EscapeString(db, StatusInfo[0], new_servername, buffer_len2);

		int buffer_len3 = strlen(SuspectName) * 2 + 1;
		char[] new_SuspectName = new char[buffer_len3];
		SQL_EscapeString(db, SuspectName, new_SuspectName, buffer_len3);

		int buffer_len4 = strlen(ReporterName) * 2 + 1;
		char[] new_ReporterName = new char[buffer_len4];
		SQL_EscapeString(db, ReporterName, new_ReporterName, buffer_len4);

		int buffer_len5 = strlen(StatusInfo[2]) * 2 + 1;
		char[] new_IP_Port = new char[buffer_len5];
		SQL_EscapeString(db, StatusInfo[2], new_IP_Port, buffer_len5);

		if (!reason[0]) {
			ReplyToCommand(client,"[SM] usage: !report <username> <reason>");
		}
		else if (SuspectName[0]) {
			Format(query, 256, "INSERT INTO reports (server_name,ip_port,reporter,reporter_id,suspect,suspect_id,reason) VALUES('%s','%s','%s','%s','%s','%s','%s');", new_servername,new_IP_Port,new_ReporterName,ReporterID,new_SuspectName,SuspectID,new_reason);
			if (SQL_FastQuery(db, query))
			{
				ReplyToCommand(client,"[SM] Your report has been sent to the admins!");
			} else {
				ReplyToCommand(client,"[SM] Couldn't send your report!");
			}
		} else {
			Format(query, 256, "INSERT INTO reports (server_name,ip_port,reporter,reporter_id,reason) VALUES ('%s','%s','%s','%s');",new_servername,new_IP_Port,new_ReporterName,ReporterID,new_reason);
			if (SQL_FastQuery(db, query))
			{
				ReplyToCommand(client,"[SM] Your report has been sent to the admins!");
			} else {
				ReplyToCommand(client,"[SM] Couldn't send your report!");
			}
		}
		
	}
	return Plugin_Handled;
}