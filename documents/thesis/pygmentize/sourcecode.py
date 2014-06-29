{
  "eventname": "ProBinder -> unreadContent",
  "conditions": [
    {
    "selector": ".context .id",
    "operator": "==",
    "compare": 18749
    }
  ],
  "actions": [
    "ProBinder -> annotateTagEntries(\"#{ .id }\")" ,
    "ProBinder -> setRead(\"#{ .id }\")"
  ]
}