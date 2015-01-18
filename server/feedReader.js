function feedReader() {

    // pass the created collections to Feed.collections()
    var collections = {
        feeds: Feeds,
        feed_entries: FeedEntries
    }

    Feed.collections(collections);

    var egis_feed = {
        _id: 'EGIS News',
        link: 'http://www.egis.fr/rss.xml',
        refresh_interval: 60000
    };

    Feed.createAtomFeed(egis_feed);

    // invoke Feed.read() to get real-time reactive social stream
    Feed.read();
}

//Subscribe to EGIS_feed
feedReader();

//Push feed_entries as messages
FeedEntries.find().observe({
  added: function (entry) {
    var msgContent = {
      name: 'EGIS-news',
      message: entry.title,
      time: Date.parse(entry.pubdate),
      link: entry.link
    };
    Messages.insert(msgContent);
  }
});
