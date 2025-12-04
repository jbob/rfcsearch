// 1. Core library imports
import { default as instantsearch } from 'instantsearch.js/es'
import {
  searchBox,
  configure,
  stats,
  hits,
  pagination,
  dynamicWidgets,
  panel,
  refinementList,
} from 'instantsearch.js/es/widgets'
import algoliasearch from 'algoliasearch/lite'
import TypesenseInstantSearchAdapter from 'typesense-instantsearch-adapter'
import hljs from 'highlight.js/lib/core'
import json from 'highlight.js/lib/languages/json'
hljs.registerLanguage('json', json)
import { createIcons, Bookmark, BookmarkCheck } from 'lucide'

// 2. CSS/Theme imports
// Webpack and css-loader process these files from the node_modules folder
//import 'instantsearch.css/themes/satellite-min.css'
import './classless.css'
import './themes.css'
import './hljs-style.css'
import 'instantsearch.css/themes/reset-min.css'
import '@fontsource/libertinus-sans'
import './index.css'

const typesenseInstantsearchAdapter = new TypesenseInstantSearchAdapter({
  server: {
    // Not really needed, since the API key is set in the backend, but the js module, wants to have it
    apiKey: '', // Be sure to use an API key that only allows searches, in production
    nodes: [
      {
        protocol: location.protocol.slice(0, -1),
        host: location.hostname,
        port: location.port,
      },
    ],
  },
  // The following parameters are directly passed to Typesense's search API endpoint.
  //  So you can pass any parameters supported by the search endpoint below.
  //  queryBy is required.
  //  filterBy is managed and overridden by InstantSearch.js. To set it, you want to use one of the filter widgets like refinementList or use the `configure` widget.
  additionalSearchParameters: {
    //queryBy: 'title,authors,content',
    queryBy: 'title,authors,content,doc_id',
    excludeFields: 'content',
  },
})
const searchClient = typesenseInstantsearchAdapter.searchClient

const search = instantsearch({
  searchClient,
  //indexName: '<%== process.env.TYPESENSE_COLLECTION %>',
  indexName: 'rfcs',
})

search.on('render', () => {
  const hitsContainer = document.getElementById('hits')
  if (hitsContainer) {
    createIcons({
      icons: {
        Bookmark,
        BookmarkCheck,
      },
    })
  }
})

const aprilFoolsTopics = [
  'avian carrier',
  'coffee pot',
  'evil bit',
  'concat cats',
  'teapot',
  'ipv6 social',
  'ascii art',
  'tea party',
]

const randomTopic =
  aprilFoolsTopics[Math.floor(Math.random() * aprilFoolsTopics.length)]

search.addWidgets([
  searchBox({
    container: '#searchbox',
    placeholder: randomTopic,
    autofocus: true,
    showReset: false,
    showSubmit: false,
    showLoadingIndicator: false,
  }),
  configure({
    hitsPerPage: 10,
  }),
  stats({
    container: '#stats',
  }),
  hits({
    container: '#hits',
    templates: {
      item(item, { html }) {
        const abstract = item._rawTypesenseHit.document.abstract
        delete item._rawTypesenseHit.document.abstract
        const fileName = item._rawTypesenseHit.document.doc_id
          .toLowerCase()
          .replace(/rfc0+/, 'rfc')
        const isMarked = window.isBookmarked(item.doc_id)
        const bookmarkIcon = isMarked ? 'bookmark-check' : 'bookmark'
        return `
          <div class="card">
            <div class="row">
              <div class="col">
                <h4>
                  ${item._highlightResult.doc_id.value}:<br />${
                    item._highlightResult.title.value
                  }
                </h4>
              </div>
              <div class="col-1">
                <button onclick="window.toggleBookmark(this, '${item.doc_id}')"><i data-lucide="${bookmarkIcon}" ></i></button>
              </div>
            </div>
            <a href="static/rfcs/${fileName}.txt">${fileName}.txt</a>
            <div class="hit-authors">
              ${item._highlightResult.authors.map((a) => a.value).join(', ')}
            </div>
            <div class="hit-publication-year">${item.pub_date}</div>
            <div class="hit-abstract">${abstract || 'No abstract'}</div>
            <details class="hit-details">
              <pre><code class="language-json">${
                hljs.highlight(
                  JSON.stringify(item._rawTypesenseHit.document, null, 2),
                  { language: 'json' },
                ).value
              }</code></pre>
            </details>
          </div>
        `
      },
    },
  }),
  pagination({
    container: '#pagination',
  }),
  dynamicWidgets({
    container: '#dynamic-widgets',
    widgets: [],
    fallbackWidget({ container, attribute }) {
      return panel({
        cssClasses: {
          root: 'card',
        },
        templates: {
          header(options, { html }) {
            return html`<big>${attribute}</big>`
          },
        },
      })(refinementList)({
        container: container,
        attribute: attribute,
        transformItems(items) {
          return items.filter((item) => !item.value.startsWith('[---'))
        },
        templates: {
          item(item, { html }) {
            const { url, label, count, isRefined } = item
            return html`
              <label>
                <input
                  type="checkbox"
                  checked=${isRefined ? 'checked' : null}
                />
                ${label} (${count})
              </label>
            `
          },
        },
      })
    },
  }),
])

search.start()

async function syncBookmarkToServer(hitId, action) {
  const endpoint = '/api/bookmarks' // Define your API endpoint

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: hitId,
        action: action, // 'add' or 'remove'
      }),
    })
    if (response.status === 401) {
      window.location.href = '/login'
      throw new Error('Unauthorized access')
    }

    if (!response.ok) {
      throw new Error('Server sync failed')
    }
  } catch (error) {
    console.error('Error syncing bookmark:', error)
  }
}

window.toggleBookmark = function (elem, hitId) {
  const isCurrentlyBookmarked = userBookmarks.includes(hitId)
  let action

  if (isCurrentlyBookmarked) {
    userBookmarks = userBookmarks.filter((id) => id !== hitId)
    action = 'remove'
  } else {
    userBookmarks.push(hitId)
    action = 'add'
  }

  syncBookmarkToServer(hitId, action)
  elem.children[0].setAttribute(
    'data-lucide',
    isCurrentlyBookmarked ? 'bookmark' : 'bookmark-check',
  )
  createIcons({
    icons: {
      Bookmark,
      BookmarkCheck,
    },
  })

  // search.render()
}

window.isBookmarked = function (hitId) {
  return window.userBookmarks.includes(hitId)
}
