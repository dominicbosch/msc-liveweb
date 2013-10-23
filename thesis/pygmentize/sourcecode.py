

on probinder->unread
if serviceId=32
do probinder->setRead(id),
   probinder->makeFileEntry(service, id)
