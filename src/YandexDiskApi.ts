import fetch from "node-fetch"

type video = {
  dimesnion: string
  size: {
    width: number
    height: number
  } | {}
  url: string
}

type resource = {
  name: string
  path: string
  type: 'dir' | 'file'
  size?: number
  ext?: string
  mediatype?: string
  duration?: number
  videos?: video[]
  downloadLink?: string
  
}
type action = 'fetch-list'|'get-dir-size'|'get-video-streams'|'download-url'
export class YandexDiskApi {
  // private pathHistory: 
  private sk!: string
  private uid!: string
  // private hash!: string
  // private currPath!: string[]
  private resources!: resource[]

  constructor(private url: string) {}

  async load() {
    try {
      const response = await fetch(this.url).then(res => res.text())
      //@ts-ignore
      const json = JSON.parse(response.match(/<script type="application\/json" id="store-prefetch">(.+?)<\/script>/, 's')[1])
      const {environment, resources} = json
      this.sk = environment.sk
      this.uid = environment.yandexuid
      this.resources = resources
      // this.hash = resources[Object.keys(resources)[0]].hash
    } catch (error) {
      console.error(error)
    } 
  }
  async parceResources() {
    const keys = Object.keys(this.resources)
    keys.shift()
    const parcedResource: resource[] = await Promise.all(
      // @ts-ignore
      keys.map((key) => this.parceResource(this.resources[key]))
    )
    return parcedResource
  }
  private async parceResource(obj: any): Promise<resource> {
    const payload: resource = {
      name: obj.name,
      type: obj.type,
      path: obj.path,
    }
    if (obj.type !== 'dir') {
      payload.size = obj.meta.size
      payload.ext = obj.meta.ext
      payload.mediatype = obj.meta.mediatype


      if (payload.mediatype === 'video') {
        const [videos, link] = await Promise.all([this.fetch(obj.path, 'get-video-streams'), this.fetch(obj.path, 'download-url')])
        payload.videos = videos.videos
        payload.downloadLink = link
      }
      else if (payload.mediatype === 'text') {
        const res = await this.fetch(obj.path, 'download-url')
        payload.downloadLink = res
      }
    }
    return payload
  }
  async fetch(path: string, action: action) {
    try {
      const res = await fetch(`https://yadi.sk/public/api/${action}`, {
        method: 'POST',
        body: JSON.stringify({
          hash: path,
          sk: this.sk
        }),
        headers: {
          'Content-Type': 'text/plain',
          Cookie: `yandexuid=${this.uid}`
        }
      })
      if (res.status !== 200) throw new Error('fetch status !== 200')
      const response = await res.json()
      if (action === 'download-url') return fetch(response.data.url).then(res => res.url)
      return response.data
    } catch (error) {
      console.error(error)
    }
  }
  static async load(url: string) {
    const yandexDiskApi = new YandexDiskApi(url)
    await yandexDiskApi.load()
    return yandexDiskApi
  }
}
