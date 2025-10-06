import { Delta } from '@vueup/vue-quill'

export type Contact = {
    address: string
    contents: string
    email: string
    latLng: string
    tel: string
    image: string
    contentsDelta: Delta | undefined
}

export type ContactUpdateRequest = {
    address: string
    contents: string
    email: string
    latLng: string
    tel: string
}
