import { MemberCategoryType } from '@/enums/MemberCategoryType'

export type Member = {
    id: string,
    email: string,
    tel: string,
    website: string,
    career: string,
    cat: MemberCategoryType,
    degree: string,
    dept: string,
    name: string,
    profile: string,
    interests: string,
    showCareer: boolean
}
