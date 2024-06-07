import axios from 'axios'
import { load } from 'cheerio'
import { State } from './types'
import { title } from 'process'

// Retrieve current state
export const retrieveState = async (
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

  console.log({title, status})

  return {
    title,
    status,
    events: [],
  } satisfies State
}
