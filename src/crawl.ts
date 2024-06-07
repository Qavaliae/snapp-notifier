import axios from 'axios'
import { load } from 'cheerio'
import { State } from './types'

// Retrieve current state
export const crawl = async (
  tracker: string,
  cookie: string,
): Promise<State> => {
  // Fetch HTML page
  const html = await axios
    .get(tracker, {
      headers: {
        Cookie: cookie,
      },
    })
    .then((response) => response.data)

  // Load the HTML string into cheerio
  const $ = load(html)

  // Read title and status
  const title = $('.c-banner__title').text()
  const status = $('.c-details-status__title').text()

  // Read events
  const events: State['events'] = []
  $('.c-details-history__description-row').each((_, el) => {
    events.push({
      name: $(el).find('td').eq(0).text(),
      date: $(el).find('td').eq(1).text(),
    })
  })

  // Return state
  return { title, status, events }
}
