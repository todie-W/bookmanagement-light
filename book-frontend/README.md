# Buchverwaltung (bookmanagement-light)

## Beschreibung
Ein Eigennutz ist der Anlass dieser Web-Applikation. Mit oder ohne Interessenten. Bücher werden in einer Sammelliste dem Betrachter zur Verfügung gestellt. In einer Merkliste werden sie verwaltet: in Gruppen aufgeteilt, als Verkauft oder Verliehen gekennzeichnet, zur Änderung und zum Löschen weitergereicht werden.


Die Datenstruktur der benötigten Tabelle "books" in der Datenbank (hier: bookstore):

```bash
{
  "_id": ObjectId('6acc1410d4fe08012418f90b'),
  "author": 'Name Autor',
  "title": 'Buchtitel',
  "description": 'Einekurze Beschreibung des Inhalts.',
  "pageNumber": NumberInt('224'),
  "year": NumberInt('1962'),
  "isbn": '0802818196',
  "genre": [
    'Fachbuch'
  ],
  __v: NumberInt('0')
}
...

Die .envi Variable ist MONGO_URI
