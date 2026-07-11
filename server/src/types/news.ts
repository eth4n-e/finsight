const Article = {
    title: 'title',
    description: 'description',
    content: 'content'
} as const;

type ArticleType = typeof Article[keyof typeof Article];

const Category = {
    general: 'general',
    world: 'world',
    nation: 'nation',
    business: 'business',
    technology: 'technology',
    entertainment: 'entertainment',
    sports: 'sports',
    science: 'science',
    health: 'health'
}

type CategoryType = typeof Category[keyof typeof Category];

export interface NewsParams {
    keywords?: string[],
    in?: ArticleType[],
    category?: CategoryType,
    max: number,
    from: Date,
    to: Date,
}

export interface NewsResult {
    title: string,
    description: string,
    content: string,
    url: string,
    image: string,
    publishedAt: string
}

// export interface SearchParams {
//     keywords: string[],
//     in: ArticleAttributes[],
//     max: number,
//     from: Date,
//     to: Date,
//     // sortBy - can do most recent or most relevant
// }

// export interface HeadlineParams {
//     keywords: string[]
//     category: string,
//     max: number,
//     from: Date,
//     to: Date,
// }