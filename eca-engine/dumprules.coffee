
fs = require 'fs'
redis = require 'redis'
db = redis.createClient 6379, 'localhost', { connect_timeout: 2000 }
dbid = process.argv[2] || 0
db.select dbid

db.smembers 'rules', ( err, arr ) ->
	if not err
		sem = arr.length
		if sem is 0
			console.log 'No entries in DB!'
			db.quit()
		for rule in arr
			db.get "rule:#{ rule }", ( err, strObj ) ->
				fs.appendFile "rules_dump_db_#{ dbid }.txt", strObj + "\n"
				if --sem is 0
					console.log 'Done'
					db.quit()

