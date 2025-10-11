import { Delta } from '@vueup/vue-quill'

export type Download = {
    id: string,
    title: string,
    contents: string,
    contentsDelta: Delta | undefined,
    file: string,
    date: string,
    showContents: boolean,
    isPrivate: boolean
}

export type DownloadCreationRequest = {
    title: string,
    contents: string
}

export type DownloadModificationRequest = {
    id: string,
    title: string,
    contents: string,
    date: string
}
