
fs = require 'fs'
redis = require 'redis'
db = redis.createClient 6379, 'localhost', { connect_timeout: 2000 }
dbid = process.argv[2] || 0
db.select dbid


fProcessUsersRuleIDs = ( err, user, obj ) ->
	if not user
		console.log 'No users found!'
	else if err
		console.log 'Error fetching ' + user
	else
		semaphore = 0
		oRules = {}
		for user, arrRules of obj
			oRules[ user ] = []
			semaphore += arrRules.length
			for rulename in arrRules
				fFetchUserRule = ( user, rulename ) ->
					( err, obj ) ->
						if obj
							oRules[ user ].push obj
						if --semaphore is 0
							fs.appendFile "rules_dump_db_#{ dbid }.txt", JSON.stringify oRules
							db.quit()
							console.log 'Done'
				db.get "user:#{ user }:rule:#{ rulename }", fFetchUserRule user, rulename



console.log 'Fetching all rules from all users in DB'
db.smembers 'users', ( err, obj ) =>
	result = {}
	if obj.length is 0
		fProcessUsersRuleIDs null, null, result
	else
		semaphore = obj.length
		for user in obj
			console.log 'Fetching user ' + user
			fProcessAnswer = ( user ) ->
				( err, obj ) =>
					if obj.length > 0
						result[user] = obj
					if --semaphore is 0
						fProcessUsersRuleIDs null, user, result
			db.smembers "user:#{ user }:rules", fProcessAnswer user

