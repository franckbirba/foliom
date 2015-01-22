feedReader = ->
  # pass the created collections to Feed.collections()
  collections =
    feeds: Feeds
    feed_entries: FeedEntries
  Feed.collections collections
  egis_feed =
    _id: 'EGIS News'
    link: 'http://www.egis.fr/rss.xml'
    refresh_interval: 60000
  Feed.createAtomFeed egis_feed
  # invoke Feed.read() to get real-time reactive social stream
  Feed.read()

#Subscribe to EGIS_feed
feedReader()

#Push feed_entries as messages
FeedEntries.find().observeChanges
  added: (id, entry) ->
    msgContent =
      name: 'EGIS-news'
      message: entry.title
      time: Date.parse(entry.pubdate)
      link: entry.link
      feed_id: id
    Messages.upsert {link: entry.link, feed_id: id}, {$set: msgContent}
