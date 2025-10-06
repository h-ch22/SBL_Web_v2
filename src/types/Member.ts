import { MemberCategoryType } from '@/enums/MemberCategoryType'
import { MemberDegreeType } from '@/enums/MemberDegreeType'
import { Delta } from '@vueup/vue-quill'

export type Member = {
    id: string,
    email: string,
    tel: string,
    website: string,
    career: string,
    careerDelta: Delta | undefined,
    cat: MemberCategoryType,
    degree: MemberDegreeType,
    dept: string,
    name: string,
    profile: string,
    interests: string,
    showCareer: boolean
}

export type MemberCreateRequest = {
    email: string,
    tel: string,
    website: string,
    career: string,
    cat: MemberCategoryType,
    degree: MemberDegreeType,
    dept: string,
    name: string,
    interests: string
}
