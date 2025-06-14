const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID'; // Please replace with your Spreadsheet ID

function getSearchQuery() {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  const hashtagsSheet = sheet.getSheetByName('hashtags');
  const wordsSheet = sheet.getSheetByName('words');
  const timeRangeSheet = sheet.getSheetByName('time_range');

  const hashtags = hashtagsSheet.getDataRange().getValues().flat().join(' ');
  const words = wordsSheet.getDataRange().getValues().flat().join(' ');
  const timeRange = timeRangeSheet.getDataRange().getValues();
  const startTime = timeRange[0][0];
  const endTime = timeRange[0][1];

  return {
    query: `${hashtags} ${words}`,
    startTime: startTime,
    endTime: endTime
  };
}

function searchX() {
  const { query, startTime, endTime } = getSearchQuery();
  const scriptProperties = PropertiesService.getScriptProperties();
  const bearerToken = scriptProperties.getProperty('X_BEARER_TOKEN');

  if (!bearerToken) {
    throw new Error("X_BEARER_TOKEN is not set in Script Properties.");
  }

  const url = `https://api.twitter.com/2/tweets/search/recent?query=${encodeURIComponent(query)}&start_time=${startTime}&end_time=${endTime}&tweet.fields=created_at,author_id,text&user.fields=name,username`;

  const options: GoogleAppsScript.URL_Fetch.URLFetchRequestOptions = {
    method: 'get',
    headers: {
      Authorization: `Bearer ${bearerToken}`
    },
    muteHttpExceptions: true
  };

  const response = UrlFetchApp.fetch(url, options);
  const results = JSON.parse(response.getContentText());

  if (results.data) {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('Results');
    const users = new Map(results.includes.users.map((user: any) => [user.id, user.name]));
    
    results.data.forEach((tweet: any) => {
      const displayName = users.get(tweet.author_id);
      sheet.appendRow([tweet.author_id, displayName, tweet.created_at, tweet.text]);
    });
  } else {
    Logger.log('No tweets found for the given query.');
    Logger.log(results);
  }
}
