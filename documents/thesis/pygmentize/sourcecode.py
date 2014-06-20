	{
		"id": "Coffee Break",
		"eventname": "uptimestatistics",
		"conditions": [
			{
				"selector": ".currentlyon",
				"operator": ">",
				"compare":42
			}
		],
		"actions":[
			"EMailYak -> sendMail( \"account@mail.com\", \"Coffee Break!\", \"[ #{ .currentlyon } are here, let's grab a coffee! ]\" )"
		]
	}