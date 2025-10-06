import { Delta } from '@vueup/vue-quill'

export type CommonBoardItem = {
    id: string
    contentsDelta: Delta | undefined
    contents: string
    date: string
    image: string
    title: string
    showContents: boolean
}

export type CommonBoardCreateRequest = {
    contents: string
    date: string
    title: string
}

export type CommonBoardUpdateRequest = {
    id: string
    contents: string
    title: string
    showContents: boolean
}
