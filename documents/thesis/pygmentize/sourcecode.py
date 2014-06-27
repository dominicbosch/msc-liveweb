
on ProBinder->unreadContent
if "#{ .context .id }" == 18749
do "ProBinder -> annotateTagEntries(\"#{ .id }\")",
   "ProBinder -> setRead(\"#{ .id }\")"
   